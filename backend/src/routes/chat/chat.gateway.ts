import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

import { ConfigService } from "@nestjs/config";
import {
  addChannels,
  addUser,
  socketAuth,
  socketCookieParser,
} from "../../utils/socket.js";
import { ChannelBanService } from "../../models/channelBan/channelBan.service.js";
import { SessionService } from "../../models/session/session.service.js";
import { UserService } from "../../models/user/user.service.js";
import { isNil } from "ramda";

@WebSocketGateway({
  cors: { origin: "http://localhost:8080", credentials: true },
  namespace: "chat",
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  // Map<userid, roomid>
  invites = new Map<number, { type: boolean; channelId: string }>();

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
    this.server.use(addChannels);
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    client.on("disconnecting", async () => {
      const username = client.request.user.displayname;
      client.rooms.forEach((r) =>
        client.to(r).emit("newMessage", {
          message: `${username} left the room`,
          login: "ADMIN",
          displayname: "ADMIN",
          id: 0,
        })
      );
    });
  }

  @SubscribeMessage("joinRoom")
  async handleRoomJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody("channel") channelName: string
  ) {
    const channel = client.request.channels.find((x) => x.name == channelName);
    if (!channel) return;

    const username = client.request.user.displayname;
    client.join(channel.id);
    client.to(channel.id).emit("newMessage", {
      message: `${username} joined the room`,
      login: "ADMIN",
      displayname: "ADMIN",
      id: 0,
    });
  }
  @SubscribeMessage("sendMessage")
  async handleEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody("channel") channelName: string,
    @MessageBody("msg") message: string
  ) {
    const channel = client.request.channels.find((x) => x.name == channelName);
    if (!channel) return;
    if (await this.channelBanService.isBanned(client.request.user.id)) {
      client.leave(channel.id);
      return;
    }
    if (await this.channelBanService.isMuted(client.request.user.id)) {
      client.emit("newMessage", {
        message: "You cannot talk because you are muted",
        login: "ADMIN",
        displayname: "ADMIN",
        id: 0,
      });
      return;
    }
    const { displayname, login, id } = client.request.user;

    client
      .to(channel.id)
      .emit("newMessage", { message, login, displayname, id });
  }

  @SubscribeMessage("sendInvite")
  handleSendInvite(
    @ConnectedSocket() client: Socket,
    @MessageBody("channel") channelName: string,
    @MessageBody("type") type: boolean
  ) {
    if (isNil(type)) return;

    const channel = client.request.channels.find((x) => x.name == channelName);
    if (!channel) return;

    const { displayname, id } = client.request.user;

    this.invites.set(id, { channelId: channel.id, type });

    this.server.to(channel.id).emit("newInvite", { id, displayname, type });
  }

  @SubscribeMessage("acceptInvite")
  handleAcceptInvite(
    @ConnectedSocket() client: Socket,
    @MessageBody("channel") channelName: string,
    @MessageBody("type") type: boolean,
    @MessageBody("id") opponentId: number
  ) {
    const channel = client.request.channels.find((x) => x.name == channelName);
    if (!channel) return;

    const invite = this.invites.get(opponentId);
    if (!invite) return;

    if (invite.channelId !== channel.id) return;
    if (invite.type !== type) return;

    this.invites.delete(opponentId);

    const id = client.request.user.id;

    client
      .to(channel.id)
      .emit("newCustomGame", { p1: opponentId, p2: id, type });
  }
}
