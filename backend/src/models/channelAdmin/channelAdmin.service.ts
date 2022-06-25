import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { ChannelAdmin } from "./channelAdmin.model.js";

@Injectable()
export class ChannelAdminService {
  constructor(
    @InjectModel(ChannelAdmin)
    private channelAdminModel: typeof ChannelAdmin
  ) {}
}
