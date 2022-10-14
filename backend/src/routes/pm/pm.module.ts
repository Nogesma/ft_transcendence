import { Module } from "@nestjs/common";
import { PmGateway } from "./pm.gateway.js";
import { BlockModule } from "../../models/block/block.module.js";
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
    BlockModule,
    SessionModule,
    UserModule,
    ChannelModule,
    ChannelMemberModule,
    ChannelAdminModule,
    ChannelBanModule,
  ],
  providers: [PmGateway],
  exports: [PmGateway],
})
export class PmModule {}
