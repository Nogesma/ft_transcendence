import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayDisconnect,
  MessageBody,
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
import { PongService } from "./pong.service.js";
import { nanoid } from "nanoid";

@WebSocketGateway({
  cors: { origin: "http://localhost:8080", credentials: true },
  namespace: "pong",
})
export class PongGateway implements OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  // we might want to user <elo, {uid, sid}> to do elo based matchmaking?
  // userId, socketId.
  classicQueue = new Map<number, string>();
  modifiedQueue = new Map<number, string>();

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
    const id = client.request.user.id;

    this.classicQueue.delete(id);
    this.modifiedQueue.delete(id);
    console.log(id);
    this.pongService.disconnectClient(client, id);
  }

  @SubscribeMessage("joinQueue")
  async joinQueue(
    @ConnectedSocket() client: Socket,
    @MessageBody() type: number
  ) {
    if (type !== 0 && type !== 1) return;

    const queue = type ? this.modifiedQueue : this.classicQueue;

    queue.set(client.request.user.id, client.id);

    client.emit("inQueue", null);

    if (queue.size >= 2) {
      const gameId = nanoid();

      const [p1, p2] = Array.from(queue.keys());

      if (!p1 || !p2) throw new Error("ID is null when starting game");

      const s1 = queue.get(p1);
      queue.delete(p1);
      const s2 = queue.get(p2);
      queue.delete(p2);

      if (!s1 || !s2) throw new Error("Socket is null when starting game");

      this.server.to(s1).to(s2).socketsJoin(gameId);

      await this.pongService.newGame(gameId, p1, p2, type);

      this.server.to(gameId).emit("matchFound", gameId);
    }
  }

  @SubscribeMessage("leaveQueue")
  async leaveQueue(@ConnectedSocket() client: Socket) {
    this.classicQueue.delete(client.request.user.id);
    this.modifiedQueue.delete(client.request.user.id);
    client.emit("notQueue", null);
  }

  @SubscribeMessage("joinGame")
  async handleGameStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() gameId: string
  ) {
    //todo: we need to make sure the user is not in another game, or at least
    // that he isn't using the same socket (this applies for playing and spectating)
    const id = client.request.user.id;

    const game = this.pongService.getGame(gameId);
    // we emit an object without any attributes if a game doesn't exist
    if (!game) return client.emit("gameInfo", {});

    client.join(gameId);

    if (game.isSpectator(id)) {
      game.newSpectator(id);
      client.to(gameId).emit("newSpectator", id);
    }

    client.emit("gameInfo", game.getInfo());
  }

  @SubscribeMessage("leaveGame")
  async handleGameLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() gameId: string
  ) {
    const id = client.request.user.id;

    const game = this.pongService.getGame(gameId);
    if (!game) return;

    client.leave(gameId);

    if (game.isSpectator(id)) {
      game.removeSpectator(client, id);
    } else {
      //todo: player chose to leave the game, forfeit immediatly.
      // unwanted disconnections where the player will have a chance to join again
      // will be handled in the handleDisconnection function
    }
  }
}
