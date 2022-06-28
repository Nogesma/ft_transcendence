import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { ChannelMembers } from "./channelMembers.model.js";

@Injectable()
export class ChannelMembersService {
  constructor(
    @InjectModel(ChannelMembers)
    private channelMembersModel: typeof ChannelMembers
  ) {}

  addMember = (chan: number, user: number) =>
    this.channelMembersModel.create({ chan, user });

  getMember = (chan: number, user: number) =>
    this.channelMembersModel.findOne({ where: { chan, user } });

  getAllChanMember = (chan: number) =>
    this.channelMembersModel.findAll({ where: { chan } });
}
