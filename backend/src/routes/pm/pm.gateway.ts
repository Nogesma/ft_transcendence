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
import { BlockService } from "../../models/block/block.service.js";
import { Server, Socket } from "socket.io";
import { ConfigService } from "@nestjs/config";
import {
  addBlock,
  addUser,
  socketAuth,
  socketCookieParser,
} from "../../utils/socket.js";
import { ChannelBanService } from "../../models/channelBan/channelBan.service.js";
import { SessionService } from "../../models/session/session.service.js";
import { UserService } from "../../models/user/user.service.js";
import type { BlockHandshake } from "../../types/socket.js";
import { find, isNil, pathEq } from "ramda";

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
    private readonly sessionService: SessionService,
    private readonly blockService: BlockService
  ) {}

  afterInit() {
    this.server.use(
      socketCookieParser(this.configService.get("COOKIE_SECRET"))
    );
    this.server.use(socketAuth(this.sessionService));
    this.server.use(addUser);
    this.server.use(addBlock);
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    const handshake = client.handshake as BlockHandshake;
    client.join(handshake.user.id.toString());

    handshake.user.status = 1;
    await handshake.user.save();
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const handshake = client.handshake as BlockHandshake;

    handshake.user.status = 0;
    await handshake.user.save();
  }

  @SubscribeMessage("ban")
  async handleBan(
    @ConnectedSocket() client: Socket,
    @MessageBody("id") id: number
  ) {
    const handshake = client.handshake as BlockHandshake;

    if (isNil(id) || isNaN(id)) return;
    if (handshake.user.id === id) return;
    if (handshake.block.has(id)) return;

    await this.blockService.blockUser(handshake.user.id, id).catch();

    const sockets = await this.server.fetchSockets();
    const userSocket = find(pathEq(["handshake", "user", "id"], id))(sockets);
    if (!userSocket) return;

    userSocket.handshake.block.add(handshake.user.id);
  }

  @SubscribeMessage("unban")
  async handleUnban(
    @ConnectedSocket() client: Socket,
    @MessageBody("id") id: number
  ) {
    if (isNil(id) || isNaN(id)) return;

    const handshake = client.handshake as BlockHandshake;

    await this.blockService.unblockUser(handshake.user.id, id).catch();

    const sockets = await this.server.fetchSockets();
    const userSocket = find(pathEq(["handshake", "user", "id"], id))(sockets);
    if (!userSocket) return;

    userSocket.handshake.block.delete(handshake.user.id);
  }

  @SubscribeMessage("status")
  async handleStatusUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody("status") status: number,
    @MessageBody("gameId") gameId: string
  ) {
    const handshake = client.handshake as BlockHandshake;

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
    const handshake = client.handshake as BlockHandshake;

    if (handshake.block.has(id)) {
      this.server.to(handshake.user.id).emit("newPM", {
        message: "You cannot talk to that person",
        id: 0,
      });
      return;
    }

    if (!message || !id || isNaN(id)) return;

    this.server.to(String(id)).emit("newPM", {
      message,
      id: handshake.user.id,
    });
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
