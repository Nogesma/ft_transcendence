import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { ChannelBan } from "./channelBan.model.js";
import { AllowNull, Column } from "sequelize-typescript";

@Injectable()
export class ChannelBanService {
  constructor(
    @InjectModel(ChannelBan)
    private channelBanModel: typeof ChannelBan
  ) {}

  banUser = (chan: number, user: number, type: boolean, expires: Date) =>
    this.channelBanModel.create({ chan, user, type, expires });

  getBanned = (user: number) =>
    this.channelBanModel.findOne({ where: { id: user, type: true } });
  getMuted = (user: number) =>
    this.channelBanModel.findOne({ where: { id: user, type: false } });

  getAllBanned = () => this.channelBanModel.findAll({ where: { type: true } });
  getAllMuted = () => this.channelBanModel.findAll({ where: { type: false } });
}
