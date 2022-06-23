import { ChatGateway } from "./chat.gateway.js";
import { Module } from "@nestjs/common";

@Module({
  providers: [ChatGateway],
})
export class ChatModule {}
