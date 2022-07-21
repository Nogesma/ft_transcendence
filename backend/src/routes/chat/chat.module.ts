import { Module } from "@nestjs/common";
import { ChatController } from "./chat.controller.js";
import { ChatService } from "./chat.service.js";
import { ChatGateway } from "./chat.gateway.js";
import { ConfigModule } from "@nestjs/config";
import { SessionModule } from "../../models/session/session.module.js";
import { UserModule } from "../../models/user/user.module.js";
import { ChannelModule } from "../../models/channel/channel.module.js";
import { ChannelMemberModule } from "../../models/channelMember/channelMember.module.js";
import { ChannelAdminModule } from "../../models/channelAdmin/channelAdmin.module.js";
import { ChannelBanModule } from "../../models/channelBan/channelBan.module.js";

@Module({
  imports: [
    ConfigModule,
    SessionModule,
    UserModule,
    ChannelModule,
    ChannelMemberModule,
    ChannelAdminModule,
    ChannelBanModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, UserModule],
})
export class ChatModule {}
