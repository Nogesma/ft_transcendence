import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { ChannelBan } from "./channelBan.model.js";

@Injectable()
export class ChannelBanService {
  constructor(
    @InjectModel(ChannelBan)
    private channelBanModel: typeof ChannelBan
  ) {}

  // TODO add back expires to create {expires: Date}, maybe?
  banUser = (chan: number, user: number, type: boolean, expires: Date) =>
    this.channelBanModel.create({ chan, user, type, expires });

  unbanUser = (chan: number, user: number, type: boolean) =>
    this.channelBanModel.destroy({ where: { chan, user, type } });

  isBanned = (user: number) =>
    this.channelBanModel.findOne({ where: { user: user, type: true } });
  isMuted = (user: number) =>
    this.channelBanModel.findOne({ where: { user: user, type: false } });

  getAllBanned = (chan: number) =>
    this.channelBanModel.findAll({ where: { type: true, channel: chan } });
  getAllMuted = (chan: number) =>
    this.channelBanModel.findAll({ where: { type: false, channel: chan } });
}
