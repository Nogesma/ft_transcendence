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

@WebSocketGateway({
  cors: { origin: "http://localhost:8080", credentials: true },
  namespace: "chat",
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection {
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
    this.server.use(addChannels);
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    if (!client) return;
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
    if (!client || !channelName) return;
    const channel = client.request.channels.find((x) => x.name == channelName);
    if (!channel) return;

    const username = client.request.user.displayname;
    client.join(client.request.user.id.toString());
    client.join(channel.id);
    console.log(client.request.user.id.toString());
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
    if (!client || !channelName || !message) return;
    const channel = client.request.channels.find((x) => x.name == channelName);
    if (!channel) return;

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
}
