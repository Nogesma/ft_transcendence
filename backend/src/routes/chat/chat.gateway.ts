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
  @SubscribeMessage("sendpm")
  async handlepm(
    @ConnectedSocket() client: Socket,
    @MessageBody("name") receiverName: string,
    @MessageBody("str") senderlogin: string
  ) {
    const channel = client.request.channels.find((x) => x.name);
    if (!channel) return;
    const receiver = await this.userService.getUserByLogin(senderlogin);
    client.join(String(receiver?.id));
    client.to(String(receiver?.id)).emit("pm", { test: String, test2: String });
  }
  @SubscribeMessage("sendMessage")
  async handleEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody("channel") channelName: string,
    @MessageBody("msg") message: string
  ) {
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
