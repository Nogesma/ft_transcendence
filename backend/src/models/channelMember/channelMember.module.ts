import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ChannelMember } from "./channelMember.model.js";
import { ChannelMemberService } from "./channelMember.service.js";

@Module({
  imports: [SequelizeModule.forFeature([ChannelMember])],
  providers: [ChannelMemberService],
  exports: [ChannelMemberService],
})
export class ChannelMemberModule {}
