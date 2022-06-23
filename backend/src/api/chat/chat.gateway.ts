import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway(3000)
export class ChatGateway {
  @WebSocketServer()
  server: Server = new Server();

  @SubscribeMessage("send_message")
  listenForMessages(@MessageBody() data: string) {
    this.server.sockets.emit("receive_message", data);
  }
}
const reta = "testa";
export default reta;
