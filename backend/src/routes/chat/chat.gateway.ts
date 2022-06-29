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


export interface ExtendedError extends Error {
  data?: never;
}

declare module "http" {
  interface IncomingMessage {
    signedCookies: { token: string };
    userId: number;
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
    private readonly sessionService: SessionService
  ) {}

  socketUse =
    (sessionService: SessionService) =>
    async (socket: Socket, next: (err?: ExtendedError) => void) => {
      const token = socket.request.signedCookies?.token;
      if (!token) return next(new Error("Token not found"));

      const session = await sessionService.getSession(token);

      if (!session || !session.user || isExpired(session.expires))
        return next(new Error("Invalid token"));

      socket.request.userId = session.user;

      next();
    };

  afterInit() {
    this.server.use(cookieParser(this.configService.get("COOKIE_SECRET")));
    this.server.use(this.socketUse(this.sessionService));
  }

  @SubscribeMessage("joinRoom")
  handleRoomJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody("id") id: number
  ) {
    console.log({ id });
    console.log(client.request.signedCookies.token);
    console.log(client.request.userId);
    client.join(String(client.request.userId));
    this.server.sockets
      .to(String(client.request.userId))
      .emit("newMessage", `User: ${client.request.userId} joined the room`);
  }

  @SubscribeMessage("leaveRoom")
  handleRoomLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: string
  ) {
    console.log("left");
    this.server.sockets
      .to(String(client.request.userId))
      .emit("newMessage", `User : ${client.request.userId} left the room`);
  }

  @SubscribeMessage("sendMessage")
  handleEvent(@ConnectedSocket() client: Socket, @MessageBody() data: string) {
    this.server.sockets
      .to(String(client.request.userId))
      .emit("newMessage", data);
  }
}
