import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Channel } from "./channel.model.js";

@Injectable()
export class ChannelService {
  constructor(
    @InjectModel(Channel)
    private channelModel: typeof Channel
  ) {}

  createChannel = (
    name: string,
    pub: boolean,
    ownerId: number,
    password: string | undefined,
    salt: string | undefined
  ) => this.channelModel.create({ name, public: pub, ownerId, password, salt });

  getChannelById = (id: number) => this.channelModel.findByPk(id);

  getChannelByName = (name: string) =>
    this.channelModel.findOne({ where: { name } });

  getPublicChannels = () =>
    this.channelModel.findAll({ where: { public: true } });
}
