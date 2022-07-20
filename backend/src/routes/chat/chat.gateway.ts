import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

import { ConfigService } from "@nestjs/config";
import cookieParser from "../../utils/socket-cookie-parser.js";
import { isExpired } from "../../utils/date.js";
import { SessionService } from "../../models/session/session.service.js";
import { type Session } from "../../models/session/session.model.js";
import { UserService } from "../../models/user/user.service.js";
import { ChannelBanService } from "../../models/channelBan/channelBan.service.js";
import { type Channel } from "../../models/channel/channel.model.js";
import type { User } from "../../models/user/user.model.js";

export interface ExtendedError extends Error {
  data?: never;
}

declare module "http" {
  export interface IncomingMessage {
    session: Session;
    channels: Channel[];
    user: User;
    signedCookies: { token: string };
  }
}

@WebSocketGateway({
  cors: { origin: "http://localhost:8080", credentials: true },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly ChannelBanService: ChannelBanService,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
    private readonly sessionService: SessionService,
    private readonly userService: UserService
  ) {}

  socketUse =
    (sessionService: SessionService) =>
    async (socket: Socket, next: (err?: ExtendedError) => void) => {
      const token = socket.request.signedCookies?.token;
      if (!token) return next(new Error("Token not found"));

      const session = await sessionService.getSession(token);
      if (!session || isExpired(session.expires))
        return next(new Error("Invalid token"));

      socket.request.session = session;
      next();
    };

  getChannels = async (socket: Socket, next: (err?: ExtendedError) => void) => {
    const user = await socket.request.session.$get("user");

    if (!user) return next(new Error("User not found"));

    const channels = await user.$get("member");
    if (!channels) return next(new Error("User not in any channels"));

    socket.request.channels = channels;
    socket.request.user = user;
    next();
  };

  afterInit() {
    this.server.use(cookieParser(this.configService.get("COOKIE_SECRET")));
    this.server.use(this.socketUse(this.sessionService));
    this.server.use(this.getChannels);
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    client.on("disconnecting", async () => {
      const username = client.request.user.displayname;
      client.rooms.forEach((r) =>
        client.to(r).emit("newMessage", `User : ${username} left the room`)
      );
    });
  }

  @SubscribeMessage("joinRoom")
  async handleRoomJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody("channel") channelName: string
  ) {
    const channel = client.request.channels.find((x) => x.name == channelName);
    if (!channel) return;

    const username = client.request.user.displayname;

    client.join(channel.id);
    client
      .to(channel.id)
      .emit("newMessage", `User: ${username} joined the room`);
  }

  @SubscribeMessage("sendMessage")
  async handleEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody("channel") channelName: string,
    @MessageBody("msg") message: string
  ) {
    const channel = client.request.channels.find((x) => x.name == channelName);
    if (!channel) return;
    if (await this.ChannelBanService.isBanned(client.request.user.id)) {
      client.emit(
        "newMessage",
        "Admin: Server: You cannot talk because you are banned"
      );
      return;
    }
    if (await this.ChannelBanService.isMuted(client.request.user.id)) {
      client.emit(
        "newMessage",
        "Admin: Server: You cannot talk because you are muted"
      );
      return;
    }

    const username = client.request.user.displayname;
    const login = client.request.user.login;
    client
      .to(channel.id)
      .emit("newMessage", `${login}: ${username}: ${message}`);
  }
}
