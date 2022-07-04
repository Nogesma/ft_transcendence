import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { ChannelBan } from "./channelBan.model.js";

@Injectable()
export class ChannelBanService {
  constructor(
    @InjectModel(ChannelBan)
    private channelBanModel: typeof ChannelBan
  ) {}

  banUser = (chan: number, user: number, type: boolean, expires: Date) =>
    this.channelBanModel.create({ chan, user, type, expires });

  isBanned = (user: number) =>
    this.channelBanModel.findOne({ where: { id: user, type: true } });
  isMuted = (user: number) =>
    this.channelBanModel.findOne({ where: { id: user, type: false } });

  getAllBanned = (chan: number) =>
    this.channelBanModel.findAll({ where: { type: true, channel: chan } });
  getAllMuted = (chan: number) =>
    this.channelBanModel.findAll({ where: { type: false, channel: chan } });
}
