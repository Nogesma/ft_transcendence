import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ConfigService } from "@nestjs/config";
import { addUser, socketAuth, socketCookieParser } from "../../utils/socket.js";
import { SessionService } from "../../models/session/session.service.js";
import type { UserHandshake } from "../../types/socket.js";
import { isNil } from "ramda";

@WebSocketGateway({
  cors: { origin: "http://localhost:8080", credentials: true },
  namespace: "status",
})
export class InfoGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
    private readonly sessionService: SessionService
  ) {}

  afterInit() {
    this.server.use(
      socketCookieParser(this.configService.get("COOKIE_SECRET"))
    );
    this.server.use(socketAuth(this.sessionService));
    this.server.use(addUser);
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    const handshake = client.handshake as UserHandshake;

    handshake.user.status = 1;
    await handshake.user.save();
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const handshake = client.handshake as UserHandshake;

    handshake.user.status = 0;
    await handshake.user.save();
  }

  @SubscribeMessage("status")
  async handleStatusUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody("status") status: number,
    @MessageBody("gameId") gameId: string
  ) {
    const handshake = client.handshake as UserHandshake;

    if (isNaN(status)) return;

    handshake.user.status = status;
    if ((status === 2 || status === 3) && !isNil(gameId))
      handshake.user.currentGame = gameId;
    else handshake.user.currentGame = "";
    await handshake.user.save();
  }
}
