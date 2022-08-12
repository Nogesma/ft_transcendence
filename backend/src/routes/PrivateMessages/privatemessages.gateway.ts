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
  namespace: "privatemessage",
})
export class PrivatemessagesGateway
  implements OnGatewayInit, OnGatewayConnection
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
    this.server.use(addChannels);
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    client.join(client.request.user.id.toString());
  }

  @SubscribeMessage("sendpm")
  async handlepm(
    @ConnectedSocket() client: Socket,
    @MessageBody("name") receiverName: string,
    @MessageBody("str") senderlogin: string,
    @MessageBody("msg") msg: string
  ) {
    const receiver = await this.userService.getUserByLogin(receiverName);
    const sender = await this.userService.getUserByLogin(senderlogin);
    if (!receiver || !sender) return;
    console.log(receiver.id);
    this.server.to(String(receiver?.id)).emit("pm", {
      msg,
      login: senderlogin,
      displayname: sender?.displayname,
    });
  }
}
