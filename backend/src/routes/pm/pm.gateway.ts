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
  invites = new Map<number, { id: number; type: boolean }>();

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

  @SubscribeMessage("sendMessage")
  async handleNewMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody("id") id: number,
    @MessageBody("message") message: string
  ) {
    const handshake = client.handshake as UserHandshake;

    if (!message || !id || isNaN(id)) return;

    this.server.to(String(id)).emit("newPM", {
      message,
      login: handshake.user.login,
      displayname: handshake.user.displayname,
      id: handshake.user.id,
    });
  }

  @SubscribeMessage("sendInvite")
  handleSendInvite(
    @ConnectedSocket() client: Socket,
    @MessageBody("channel") id: number,
    @MessageBody("type") type: boolean
  ) {
    const handshake = client.handshake as UserHandshake;
    if (isNil(type) || !id || isNaN(id)) return;

    this.invites.set(handshake.user.id, { id: Number(id), type });

    this.server.to(String(id)).emit("newInvite", {
      id: handshake.user.id,
      displayname: handshake.user.id,
      type,
    });
  }

  @SubscribeMessage("acceptInvite")
  handleAcceptInvite(
    @ConnectedSocket() client: Socket,
    @MessageBody("id") id: number,
    @MessageBody("type") type: boolean
  ) {
    const handshake = client.handshake as UserHandshake;
    if (isNil(type) || !id || isNaN(id)) return;

    const invite = this.invites.get(id);
    if (!invite) return;

    if (invite.id !== handshake.user.id) return;
    if (invite.type !== type) return;

    this.invites.delete(id);

    this.server
      .to(String(id))
      .to(String(handshake.user.id))
      .emit("newCustomGame", { p1: id, p2: handshake.user.id, type });
  }

  newPendingFriendRequest(id: number, fid: number) {
    this.server.to(String(id)).emit("newPendingFriendRequest", fid);
  }

  newFriend(id: number, fid: number) {
    this.server.to(String(id)).emit("newFriend", fid);
  }

  delFriend(id: number, fid: number) {
    this.server.to(String(id)).emit("delFriend", fid);
  }
}
