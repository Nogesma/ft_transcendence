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
import { ChannelBanService } from "../../models/channelBan/channelBan.service.js";
import { SessionService } from "../../models/session/session.service.js";
import { UserService } from "../../models/user/user.service.js";
import type { UserHandshake } from "../../types/socket.js";
import { isNil } from "ramda";

@WebSocketGateway({
  cors: { origin: "http://localhost:8080", credentials: true },
  namespace: "privatemessage",
})
export class PmGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly channelBanService: ChannelBanService,
    private readonly userService: UserService,
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

    client.join(handshake.user.id.toString());

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
  @SubscribeMessage("banpm")
  async handleBan(
    @ConnectedSocket() client: Socket,
    @MessageBody("id") id: number
  ) {
    const handshake = client.handshake as UserHandshake;
    if (!id || isNaN(id)) return;
    return;
  }
  @SubscribeMessage("sendpm")
  async handlepm(
    @ConnectedSocket() client: Socket,
    @MessageBody("id") id: number,
    @MessageBody("pmmsg") msg: string
  ) {
    const handshake = client.handshake as UserHandshake;
    if (!msg || !id || isNaN(id)) return;
    this.server.to(String(id)).emit("pm", {
      msg,
      displayname: handshake.user.displayname,
    });
  }
}
