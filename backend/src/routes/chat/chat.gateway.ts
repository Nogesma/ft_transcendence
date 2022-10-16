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
import { equals, find, isNil, pathEq, propEq, unless } from "ramda";
import dayjs from "dayjs";
import { ChannelAdminService } from "../../models/channelAdmin/channelAdmin.service.js";
import type { ChannelHandshake } from "../../types/socket.js";
import type { Channel } from "../../models/channel/channel.model.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

dayjs.extend(customParseFormat);

@WebSocketGateway({
  cors: { origin: "http://localhost:8080", credentials: true },
  namespace: "chat",
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  // Map<userid, roomid>
  invites = new Map<number, { type: boolean; channelId: string }>();
  connectedMembers = new Map<number, Set<number>>();

  constructor(
    private readonly channelBanService: ChannelBanService,
    private readonly userService: UserService,
    private readonly configService: ConfigService<EnvironmentVariables, true>,
    private readonly sessionService: SessionService,
    private readonly channelAdminService: ChannelAdminService
  ) {}

  afterInit() {
    this.server.use(
      socketCookieParser(this.configService.get("COOKIE_SECRET"))
    );
    this.server.use(socketAuth(this.sessionService));
    this.server.use(addUser);
    this.server.use(addChannels(this.channelBanService));
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    client.on("disconnecting", async () => {
      const handshake = client.handshake as ChannelHandshake;
      const username = handshake.user.displayname;
      client.rooms.forEach((r) =>
        client
          .to(r)
          .emit("delMember", { displayname: username, id: handshake.user.id })
      );
    });
  }

  @SubscribeMessage("joinRoom")
  handleRoomJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody("channel") channelName: string
  ) {
    const handshake = client.handshake as ChannelHandshake;
    const channel: Channel | undefined = find(
      propEq("name", channelName),
      handshake.channels as Channel[]
    );
    if (!channel) {
      this.server.to(client.id).emit("channelInfo", { memberList: null });
      return;
    }

    const { displayname, id } = handshake.user;

    this.handleRoomLeave(client);

    client.join(channel.id);

    let members = this.connectedMembers.get(channel.id);
    if (!members) {
      this.connectedMembers.set(channel.id, new Set());
      members = this.connectedMembers.get(channel.id);
      if (!members) return;
    }
    members.add(id);

    this.server
      .to(client.id)
      .emit("channelInfo", { memberList: Array.from(members) });

    client.to(channel.id).emit("newMember", { displayname, id });
  }

  @SubscribeMessage("leaveRooms")
  handleRoomLeave(@ConnectedSocket() client: Socket) {
    const handshake = client.handshake as ChannelHandshake;

    client.rooms.forEach(
      unless(equals(client.id), (x) => {
        client.to(x).emit("delMember", {
          displayname: handshake.user.displayname,
          id: handshake.user.id,
        });
        client.leave(x);
        this.connectedMembers.get(Number(x))?.delete(handshake.user.id);
      })
    );
  }

  @SubscribeMessage("sendMessage")
  handleEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody("channel") channelName: string,
    @MessageBody("msg") message: string
  ) {
    const handshake = client.handshake as ChannelHandshake;
    const channel: Channel | undefined = find(
      propEq("name", channelName),
      handshake.channels as Channel[]
    );
    if (!channel) return;

    const date = handshake.muted.get(channel.id);
    if (date) {
      if (date < new Date()) {
        handshake.muted.set(channel.id, null);
        // todo: check that remove does what we want
        channel.$remove("ban", handshake.user.id);
      } else {
        client.emit("newMessage", {
          message: "You cannot talk because you are muted",
          login: "ADMIN",
          displayname: "ADMIN",
          id: 0,
        });
        return;
      }
    }

    const { displayname, login, id } = handshake.user;

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

    const handshake = client.handshake as ChannelHandshake;
    const channel: Channel | undefined = find(
      propEq("name", channelName),
      handshake.channels as Channel[]
    );
    if (!channel) return;

    const { displayname, id } = handshake.user;

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
    const handshake = client.handshake as ChannelHandshake;
    const channel: Channel | undefined = find(
      propEq("name", channelName),
      handshake.channels as Channel[]
    );
    if (!channel) return;

    const invite = this.invites.get(opponentId);
    if (!invite) return;

    if (invite.channelId !== channel.id) return;
    if (invite.type !== type) return;

    this.invites.delete(opponentId);

    this.server
      .to(channel.id)
      .emit("newCustomGame", { p1: opponentId, p2: handshake.user.id, type });
  }

  @SubscribeMessage("banUser")
  async handleBan(
    @ConnectedSocket() client: Socket,
    @MessageBody("channel") channelName: string,
    @MessageBody("username") username: string,
    @MessageBody("expires") expires: Date
  ) {
    const handshake = client.handshake as ChannelHandshake;
    const channel: Channel | undefined = find(
      propEq("name", channelName),
      handshake.channels as Channel[]
    );
    if (!channel) return;

    const id = handshake.user.id;

    const isAdmin =
      id === channel.ownerId ||
      (await this.channelAdminService.getAdmin(channel.id, id));
    if (!isAdmin) return;

    const date = expires ? dayjs(expires) : dayjs(0);
    const user = await this.userService.getUserByLogin(username);
    if (!user) return;

    // Cannot ban yourself.
    if (user.id === id) return;
    // Cannot ban owner.
    if (user.id === channel.ownerId) return;
    // Can only ban admin if owner.
    const isUserAdmin = await this.channelAdminService.getAdmin(
      channel.id,
      user.id
    );
    if (id !== channel.ownerId && isUserAdmin) return;

    const userBan = await this.channelBanService.getUser(channel.id, user.id);
    if (userBan) {
      userBan.type = true;
      userBan.expires = date.toDate();
      await userBan.save();
    } else
      await this.channelBanService.banUser(channel.id, user.id, date.toDate());

    // todo: check that it works
    await channel.$remove("member", user);
    if (isUserAdmin)
      await this.channelAdminService.removeAdmin(channel.id, user.id);

    const sockets = await this.server.fetchSockets();
    const userSocket = find(pathEq(["handshake", "user", "id"], user.id))(
      sockets
    );

    if (!userSocket) return;
    userSocket.leave(channel.id);
  }

  @SubscribeMessage("muteUser")
  async handleMute(
    @ConnectedSocket() client: Socket,
    @MessageBody("channel") channelName: string,
    @MessageBody("username") username: string,
    @MessageBody("expires") expires: Date
  ) {
    const handshake = client.handshake as ChannelHandshake;
    const channel: Channel | undefined = find(
      propEq("name", channelName),
      handshake.channels as Channel[]
    );
    if (!channel) return;

    const id = handshake.user.id;

    const isAdmin =
      id === channel.ownerId ||
      (await this.channelAdminService.getAdmin(channel.id, id));
    if (!isAdmin) return;

    const date = expires ? dayjs(expires) : dayjs(0);
    const user = await this.userService.getUserByLogin(username);
    if (!user) return;

    // Cannot mute yourself.
    if (user.id === id) return;
    // Cannot mute owner.
    if (user.id === channel.ownerId) return;
    // Can only mute admin if owner.
    if (
      id !== channel.ownerId &&
      (await this.channelAdminService.getAdmin(channel.id, user.id))
    )
      return;

    const userBan = await this.channelBanService.getUser(channel.id, user.id);
    if (userBan) {
      if (userBan.type) return;

      userBan.expires = date.toDate();
      await userBan.save();
    } else
      await this.channelBanService.muteUser(channel.id, user.id, date.toDate());

    const sockets = await this.server.fetchSockets();
    const userSocket: Socket = find(
      pathEq(["handshake", "user", "id"], user.id)
    )(sockets);

    if (!userSocket) return;
    (userSocket.handshake as ChannelHandshake).muted.set(
      channel.id,
      date.toDate()
    );
  }

  @SubscribeMessage("unbanUser")
  async handleUnBan(
    @ConnectedSocket() client: Socket,
    @MessageBody("channel") channelName: string,
    @MessageBody("username") username: string
  ) {
    const handshake = client.handshake as ChannelHandshake;
    const channel: Channel | undefined = find(
      propEq("name", channelName),
      handshake.channels as Channel[]
    );
    if (!channel) return;

    const id = handshake.user.id;

    const isAdmin =
      id === channel.ownerId ||
      (await this.channelAdminService.getAdmin(channel.id, id));
    if (!isAdmin) return;

    const user = await this.userService.getUserByLogin(username);
    if (!user) return;

    if (!(await this.channelBanService.isBanned(channel.id, user.id))) return;
    await this.channelBanService.unbanUser(channel.id, user.id);
  }

  @SubscribeMessage("unmuteUser")
  async handleUnMute(
    @ConnectedSocket() client: Socket,
    @MessageBody("channel") channelName: string,
    @MessageBody("username") username: string
  ) {
    const handshake = client.handshake as ChannelHandshake;
    const channel: Channel | undefined = find(
      propEq("name", channelName),
      handshake.channels as Channel[]
    );
    if (!channel) return;

    const id = handshake.user.id;

    const isAdmin =
      id === channel.ownerId ||
      (await this.channelAdminService.getAdmin(channel.id, id));
    if (!isAdmin) return;

    const user = await this.userService.getUserByLogin(username);
    if (!user) return;

    if (!(await this.channelBanService.isMuted(channel.id, user.id))) return;
    await this.channelBanService.unmuteUser(channel.id, user.id);

    const sockets = await this.server.fetchSockets();
    const userSocket: Socket = find(
      pathEq(["handshake", "user", "id"], user.id)
    )(sockets);

    if (!userSocket) return;
    (userSocket.handshake as ChannelHandshake).muted.set(channel.id, null);
  }
}
