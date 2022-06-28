import { Module } from "@nestjs/common";
import { ChatController } from "./chat.controller.js";
import { ChatService } from "./chat.service.js";
import { ChatGateway } from "./chat.gateway.js";
import { ConfigModule } from "@nestjs/config";
import { SessionModule } from "../../models/session/session.module.js";
import { UserModule } from "../../models/user/user.module.js";
import { ChannelModule } from "../../models/channel/channel.module.js";
import { ChannelMemberModule } from "../../models/channelMember/channelMember.module.js";

@Module({
  imports: [
    ConfigModule,
    SessionModule,
    UserModule,
    ChannelModule,
    ChannelMemberModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
