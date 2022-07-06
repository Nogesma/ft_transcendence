import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

import { ConfigService } from "@nestjs/config";
import cookieParser from "../../utils/socket-cookie-parser.js";
import { isExpired } from "../../utils/date.js";
import { SessionService } from "../../models/session/session.service.js";
import { ChannelMemberService } from "../../models/channelMember/channelMember.service.js";
import { ChannelBanService } from "../../models/channelBan/channelBan.service.js";
import { type Session } from "../../models/session/session.model.js";
import { UserService } from "../../models/user/user.service.js";
import { User } from "../../models/user/user.model.js";

export interface ExtendedError extends Error {
  data?: never;
}

declare module "http" {
  export interface IncomingMessage {
    session: Session;
    signedCookies: { token: string };
  }
}

@WebSocketGateway({
  cors: { origin: "http://localhost:8080", credentials: true },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
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

  afterInit() {
    this.server.use(cookieParser(this.configService.get("COOKIE_SECRET")));
    this.server.use(this.socketUse(this.sessionService));
  }

  @SubscribeMessage("joinRoom")
  async handleRoomJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody("id") id: number
  ) {
    const usr = await this.userService.getUserLogin(
      client.request.session.userId
    );
    const add_member = (Chan: ChannelMemberService, Ban: ChannelBanService) => {
      if (!Ban.isBanned(id)) {
        client.emit(
          "newMessage",
          `Error: Cannot join room because you are banned`
        );
        return;
      }
      Chan.addMember(client.request.session.id, id);
    };

    client.join(id.toString());
    const it = client.rooms.values();
    it.next();
    client.broadcast
      .to(it.next().value)
      .emit("newMessage", `User: ${usr} joined the room`);
  }

  @SubscribeMessage("leaveRoom")
  async handleRoomLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: string
  ) {
    console.log("left");
    this.server.sockets.emit(
      "newMessage",
      `User : ${await this.userService.getUserLogin(
        client.request.session.userId
      )} left the room`
    );
  }
  @SubscribeMessage("sendMessage")
  async handleEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: string
  ) {
    const it = client.rooms.values();
    it.next();
    this.server.sockets
      .to(it.next().value)
      .emit(
        "newMessage",
        `${await this.userService.getUserLogin(
          client.request.session.userId
        )}: ${data}`
      );
  }
}
