import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { ChannelBan } from "./channelBan.model.js";

@Injectable()
export class ChannelBanService {
  constructor(
    @InjectModel(ChannelBan)
    private channelBanModel: typeof ChannelBan
  ) {}

  banUser = (chan: number, user: number, expires: Date) =>
    this.channelBanModel.create({ chan, user, type: true, expires });

  muteUser = (chan: number, user: number, expires: Date) =>
    this.channelBanModel.create({ chan, user, type: false, expires });

  unbanUser = (chan: number, user: number) =>
    this.channelBanModel.destroy({ where: { chan, user, type: true } });

  unmuteUser = (chan: number, user: number) =>
    this.channelBanModel.destroy({ where: { chan, user, type: false } });

  isBanned = (user: number) =>
    this.channelBanModel.findOne({ where: { user, type: true } });

  isMuted = (user: number) =>
    this.channelBanModel.findOne({ where: { user, type: false } });

  isInTable = (user: number) =>
    this.channelBanModel.findOne({ where: { user } });

  getAllBanned = (channel: number) =>
    this.channelBanModel.findAll({ where: { type: true, channel } });
  getAllMuted = (channel: number) =>
    this.channelBanModel.findAll({ where: { type: false, channel } });
}
