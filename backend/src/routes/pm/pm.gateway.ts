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
  async handleban(
    @ConnectedSocket() client: Socket,
    @MessageBody("id") id: number
  ) {
    const handshake = client.handshake as BlockHandshake;
    if (isNil(id) || isNaN(id)) return;
    if (handshake.user.id === id) return;

    await this.blockService.blockUser(handshake.user.id, id);
    //todo: update blocked_by if user blocked is connected
    const sockets = await this.server.fetchSockets();
    const userSocket = find(pathEq(["handshake", "user", "id"], id))(sockets);

    if (!userSocket) return;
    userSocket.leave(handshake.user.id);
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
  @SubscribeMessage("sendpm")
  async handlepm(
    @ConnectedSocket() client: Socket,
    @MessageBody("id") id: number,
    @MessageBody("pmmsg") msg: string
  ) {
    const handshake = client.handshake as BlockHandshake;

    const isBlocked = find(pathEq(["id"], id))(handshake.block);
    if (isBlocked) {
      this.server.to(String(handshake.user.id)).emit("pm", {
        msg: "You cannot talk to that person",
        displayname: "Server",
      });
      return;
    }

    if (!msg || !id || isNaN(id)) return;
    this.server.to(String(id)).emit("pm", {
      msg,
      displayname: handshake.user.displayname,
    });
  }
}
