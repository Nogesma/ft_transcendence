import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Channel } from "./channel.model.js";

@Injectable()
export class ChannelService {
  constructor(
    @InjectModel(Channel)
    private channelModel: typeof Channel
  ) {}

  createChannel = ({
    name,
    pub,
    ownerId,
    password,
  }: {
    name: string;
    pub: boolean;
    ownerId: number;
    password: string | undefined;
  }) =>
    this.channelModel
      .create({ name, public: pub, ownerId, password })
      .catch(console.error);

  deleteChannel = (name: string) =>
    this.channelModel.destroy({ where: { name } }).catch(console.error);

  getChannelById = (id: number) => this.channelModel.findByPk(id);

  getChannelByName = (name: string) =>
    this.channelModel.findOne({ where: { name } }).catch(console.error);

  getPublicChannels = () =>
    this.channelModel.findAll({ where: { public: true } });
}
