import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ChannelMembers } from "./channelMembers.model.js";
import { ChannelMembersService } from "./channelMembers.service.js";

@Module({
  imports: [SequelizeModule.forFeature([ChannelMembers])],
  providers: [ChannelMembersService],
  exports: [ChannelMembersService],
})
export class ChannelMembersModel {}
