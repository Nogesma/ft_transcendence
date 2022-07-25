import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

import { ConfigService } from "@nestjs/config";
import {
  addStats,
  addUser,
  socketAuth,
  socketCookieParser,
} from "../../utils/socket.js";
import { SessionService } from "../../models/session/session.service.js";
import { equals, includes, reject } from "ramda";
import { PongService } from "./pong.service.js";
import { nanoid } from "nanoid";

@WebSocketGateway({
  cors: { origin: "http://localhost:8080", credentials: true },
  namespace: "pong",
})
export class PongGateway implements OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  queue: Array<{ userId: number; socketId: string }> = [];

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
    private readonly sessionService: SessionService,
    private readonly pongService: PongService
  ) {}

  afterInit() {
    this.server.use(
      socketCookieParser(this.configService.get("COOKIE_SECRET"))
    );
    this.server.use(socketAuth(this.sessionService));
    this.server.use(addUser);
    this.server.use(addStats);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const id = { userId: client.request.user.id, socketId: client.id };

    this.queue = reject(equals(id), this.queue);
  }

  @SubscribeMessage("joinQueue")
  async joinQueue(@ConnectedSocket() client: Socket) {
    const id = { userId: client.request.user.id, socketId: client.id };
    if (!includes(id, this.queue)) this.queue.push(id);

    client.emit("inQueue", null);

    if (this.queue.length >= 2) {
      console.log(this.queue);
      const gameId = nanoid();

      const p1 = this.queue.shift();
      const p2 = this.queue.shift();

      if (!p1 || !p2) throw new Error("ID is null when starting game");

      this.server.to(p1.socketId).to(p2.socketId).socketsJoin(gameId);

      this.pongService.newGame(gameId, p1.userId, p2.userId);

      this.server
        .to(gameId)
        .emit("matchFound", { p1: p1.userId, p2: p2.userId });
    }
  }

  @SubscribeMessage("leaveQueue")
  async leaveQueue(@ConnectedSocket() client: Socket) {
    const id = { userId: client.request.user.id, socketId: client.id };
    if (!includes(id, this.queue)) this.queue.push(id);

    this.queue = reject(equals(id), this.queue);

    client.emit("notQueue", null);
  }

  @SubscribeMessage("playerReady")
  async handleGameStart(@ConnectedSocket() client: Socket) {
    // todo
  }
}
