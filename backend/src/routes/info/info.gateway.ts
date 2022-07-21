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
import { socketAuth, socketCookieParser } from "../../utils/socket.js";
import { SessionService } from "../../models/session/session.service.js";
import type { Session } from "../../models/session/session.model.js";
import type { User } from "../../models/user/user.model.js";

export interface ExtendedError extends Error {
  data?: never;
}

declare module "http" {
  export interface IncomingMessage {
    session: Session;
    user: User;
    signedCookies: { token: string };
  }
}

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
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    client.request.user.status = 1;
    await client.request.user.save();
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    client.request.user.status = 0;
    await client.request.user.save();
  }

  @SubscribeMessage("status")
  async handleStatusUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody("status") status: number
  ) {
    client.request.user.status = status;
    await client.request.user.save();
  }
}
