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
import { socketAuth, socketCookieParser } from "../../utils/socket.js";
import { SessionService } from "../../models/session/session.service.js";
import type { Session } from "../../models/session/session.model.js";
import type { Channel } from "../../models/channel/channel.model.js";
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
  namespace: "chat",
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
    private readonly sessionService: SessionService
  ) {}

  getChannels = async (socket: Socket, next: (err?: ExtendedError) => void) => {
    const user = socket.request.user;

    const channels = await user.$get("member");
    if (!channels) return next(new Error("User not in any channels"));

    socket.request.channels = channels;
    next();
  };

  afterInit() {
    this.server.use(
      socketCookieParser(this.configService.get("COOKIE_SECRET"))
    );
    this.server.use(socketAuth(this.sessionService));
    this.server.use(this.getChannels);
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    client.on("disconnecting", async () => {
      const username = client.request.user.login;
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

    const username = client.request.user.login;

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

    const username = client.request.user.login;

    client.to(channel.id).emit("newMessage", `${username}: ${message}`);
  }
}
