import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { ChannelBan } from "./channelBan.model.js";

@Injectable()
export class ChannelBanService {
  constructor(
    @InjectModel(ChannelBan)
    private channelBanModel: typeof ChannelBan
  ) {}
}
