import { ChatGateway } from "./chat.gateway.js";
import { ConfigModule } from "@nestjs/config";
import { Module } from "@nestjs/common";
import { SessionModule } from "../session/session.module.js";

@Module({
  imports: [ConfigModule, SessionModule],
  providers: [ChatGateway],
})
export class ChatModule {}
