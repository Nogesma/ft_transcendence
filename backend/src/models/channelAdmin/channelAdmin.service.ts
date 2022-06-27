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

  getAdmin = (user: number) => this.channelAdminModel.findByPk(user);
}
