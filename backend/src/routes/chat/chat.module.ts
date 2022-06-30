import { Module } from "@nestjs/common";
import { ChatController } from "./chat.controller.js";
import { ChatService } from "./chat.service.js";
import { ChatGateway } from "./chat.gateway.js";
import { ConfigModule } from "@nestjs/config";
import { SessionModule } from "../../models/session/session.module.js";

@Module({
  imports: [ConfigModule, SessionModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
