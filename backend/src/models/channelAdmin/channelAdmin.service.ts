import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { ChannelAdmin } from "./channelAdmin.model.js";

@Injectable()
export class ChannelAdminService {
  constructor(
    @InjectModel(ChannelAdmin)
    private channelBanModel: typeof ChannelAdmin
  ) {}

  banUser = (chan: number, user: number, type: boolean, expires: Date) =>
    this.channelBanModel.create({ chan, user, type, expires });

  getBanned = (user: number) =>
    this.channelBanModel.findOne({ where: { id: user, type: true } });
  getMuted = (user: number) =>
    this.channelBanModel.findOne({ where: { id: user, type: false } });

  getAllBanned = (chan: number) =>
    this.channelBanModel.findAll({ where: { type: true, channel: chan } });
  getAllMuted = (chan: number) =>
    this.channelBanModel.findAll({ where: { type: false, channel: chan } });
}
