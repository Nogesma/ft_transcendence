import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway({
  cors: { origin: "http://localhost:8080", credentials: true },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;
  @SubscribeMessage("sendMessage")
  handleEvent(@MessageBody() data: string) {
    this.server.sockets.emit("newMessage", data);
  }
}
