import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ChannelAdminService } from "./channelAdmin.service.js";
import { ChannelAdmin } from "./channelAdmin.model.js";

@Module({
  imports: [SequelizeModule.forFeature([ChannelAdmin])],
  providers: [ChannelAdminService],
  exports: [ChannelAdminService],
})
export class ChannelAdminModule {}
