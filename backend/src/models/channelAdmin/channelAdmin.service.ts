import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { ChannelAdmin } from "./channelAdmin.model.js";

@Injectable()
export class ChannelAdminService {
  constructor(
    @InjectModel(ChannelAdmin)
    private channelAdminModel: typeof ChannelAdmin
  ) {}

  addAdmin = (chan: number, user: number) =>
    this.channelAdminModel.create({ chan, user });

  removeAdmin = (chan: number, user: number) =>
    this.channelAdminModel
      .destroy({ where: { chan, user } })
      .catch(console.error);

  getAdmin = (chan: number, user: number) =>
    this.channelAdminModel.findOne({ where: { chan, user } });

  getAllAdmin = (chan: number) =>
    this.channelAdminModel.findAll({ where: { channel: chan } });
}
