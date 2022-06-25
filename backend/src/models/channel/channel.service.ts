import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Channel } from "./channel.model.js";

@Injectable()
export class ChannelService {
  constructor(
    @InjectModel(Channel)
    private channelModel: typeof Channel
  ) {}
}
