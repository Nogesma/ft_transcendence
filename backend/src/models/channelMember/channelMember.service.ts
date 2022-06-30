import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { ChannelMember } from "./channelMember.model.js";
import { Channel } from "../channel/channel.model.js";

@Injectable()
export class ChannelMemberService {
  constructor(
    @InjectModel(ChannelMember)
    private channelMemberModel: typeof ChannelMember
  ) {}

  addMember = (chan: number, user: number) =>
    this.channelMemberModel.create({ chan, user });

  getMember = (chan: number, user: number) =>
    this.channelMemberModel.findOne({ where: { chan, user } });

  getAllChanMember = (user: number) =>
    this.channelMemberModel.findAll({ where: { user } });
}
