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

let array: Array<string>;
array = new Array<string>();
@WebSocketGateway({
  cors: { origin: "http://localhost:8080", credentials: true },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;
  @SubscribeMessage("events")
  handleEvent(@MessageBody() data: string) {
    array.push(data);
    this.server.sockets.emit("events", array);
  }
}
const reta = "testa";
export default reta;
