import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ChannelBanService } from "./channelBan.service.js";
import { ChannelBan } from "./channelBan.model.js";

@Module({
  imports: [SequelizeModule.forFeature([ChannelBan])],
  providers: [ChannelBanService],
  exports: [ChannelBanService],
})
export class ChannelBanModule {}
