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
    password: string,
    owner: number
  ) => this.channelModel.create({ name, public: pub, password, owner });

  getPubblicChannels = () =>
    this.channelModel.findAll({ where: { public: true } });

  getChannelById = (id: number) => this.channelModel.findByPk(id);

  getChannelByName = (name: string) =>
    this.channelModel.findOne({ where: { name } });

  findChannelByName = (name: string) => this.channelModel.findByPk(name);
}
