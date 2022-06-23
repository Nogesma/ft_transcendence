import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Server } from "socket.io";
import { Socket } from "net";

@WebSocketGateway({
  cors: { origin: "http://localhost:8080", credentials: true },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;
  @SubscribeMessage("events")
  handleEvent(@MessageBody() data: string) {
    this.server.sockets.emit("events", data);
  }
}
const reta = "testa";
export default reta;
