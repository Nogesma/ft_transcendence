import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

import { ConfigService } from "@nestjs/config";
import cookieParser from "../../utils/socket-cookie-parser.js";
import { isExpired } from "../../utils/date.js";
import { SessionService } from "../../models/session/session.service.js";
import { type Session } from "../../models/session/session.model.js";

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
    private readonly sessionService: SessionService
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

  handleConnection(socket: Socket) {
    socket.join("room1");
    this.server.sockets
      .to("room1")
      .emit(
        "newMessage",
        `User: ${socket.request.session.userId} joined the room`
      );
    console.log(socket.request.session.userId);
  }

  @SubscribeMessage("sendMessage")
  handleEvent(@MessageBody() data: string) {
    this.server.sockets.to("room1").emit("newMessage", data);
  }
}