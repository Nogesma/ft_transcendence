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
import { addUser, socketAuth, socketCookieParser } from "../../utils/socket.js";
import { SessionService } from "../../models/session/session.service.js";
import { PongService } from "./pong.service.js";
import { nanoid } from "nanoid";
import { isNil } from "ramda";
import type { UserHandshake } from "../../types/socket.js";

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
  customQueue = new Map<
    number,
    { socket: string; opponent: number; type: boolean }
  >();

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
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const handshake = client.handshake as UserHandshake;

    const id = handshake.user.id;

    this.classicQueue.delete(id);
    this.modifiedQueue.delete(id);
    this.customQueue.delete(id);
    this.pongService.disconnectClient(client, id);
  }

  @SubscribeMessage("joinQueue")
  async joinQueue(
    @ConnectedSocket() client: Socket,
    @MessageBody() type: boolean
  ) {
    const handshake = client.handshake as UserHandshake;

    if (isNil(type)) return;

    const queue = type ? this.modifiedQueue : this.classicQueue;

    queue.set(handshake.user.id, client.id);

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
    const handshake = client.handshake as UserHandshake;

    const id = handshake.user.id;

    this.classicQueue.delete(id);
    this.modifiedQueue.delete(id);
    this.customQueue.delete(id);
    client.emit("notQueue", null);
  }

  @SubscribeMessage("joinGame")
  async handleGameStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() gameId: string
  ) {
    const handshake = client.handshake as UserHandshake;

    //todo: we need to make sure the user is not in another game, or at least
    // that he isn't using the same socket (this applies for playing and spectating)
    const id = handshake.user.id;

    const game = this.pongService.getGame(gameId);
    // we emit an object without any attributes if a game doesn't exist
    if (!game) return client.emit("gameInfo", {});

    client.join(gameId);

    if (!game.isPlayer(id)) {
      game.newSpectator(id);
      client.to(gameId).emit("newSpectator", id);

      client.emit("gameInfo", game.getInfo());
      return;
    }

    client.emit("gameInfo", game.getInfo());
    game.setReady(this.server, id);
  }

  @SubscribeMessage("customGame")
  async handleCustomGame(
    @ConnectedSocket() client: Socket,
    @MessageBody("id") opponentId: number,
    @MessageBody("type") type: boolean
  ) {
    const handshake = client.handshake as UserHandshake;

    const id = handshake.user.id;

    if (isNil(type) || isNaN(opponentId)) return;

    client.emit("inQueue", null);

    const queue = this.customQueue.get(opponentId);

    if (queue) {
      if (queue.opponent !== id || queue.type !== type) return;

      const gameId = nanoid();

      const p1 = opponentId;
      const s1 = queue.socket;

      const p2 = id;
      const s2 = client.id;

      this.customQueue.delete(opponentId);

      this.server.to(s1).to(s2).socketsJoin(gameId);

      await this.pongService.newGame(gameId, p1, p2, type);

      this.server.to(gameId).emit("matchFound", gameId);
    } else {
      this.customQueue.set(handshake.user.id, {
        socket: client.id,
        opponent: opponentId,
        type,
      });
    }
  }

  @SubscribeMessage("leaveGame")
  async handleGameLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() gameId: string
  ) {
    const handshake = client.handshake as UserHandshake;

    const id = handshake.user.id;

    const game = this.pongService.getGame(gameId);
    if (!game) return;

    client.leave(gameId);

    if (!game.isPlayer(id)) {
      game.removeSpectator(client, id);
    } else {
      //todo: player chose to leave the game, forfeit immediatly.
      // unwanted disconnections where the player will have a chance to join again
      // will be handled in the handleDisconnection function
    }
  }

  @SubscribeMessage("move")
  handleMove(
    @ConnectedSocket() client: Socket,
    @MessageBody("dir") move: number,
    @MessageBody("game") gameId: string
  ) {
    const handshake = client.handshake as UserHandshake;
    const id = handshake.user.id;

    const game = this.pongService.getGame(gameId);
    if (!game) return;
    if (!game.isPlayer(id)) return;

    game.applyMove(id, move);
  }
}
