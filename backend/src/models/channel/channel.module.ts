import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ChannelService } from "./channel.service.js";
import { Channel } from "./channel.model.js";

@Module({
  imports: [SequelizeModule.forFeature([Channel])],
  providers: [ChannelService],
  exports: [ChannelService],
})
export class ChannelModule {}
