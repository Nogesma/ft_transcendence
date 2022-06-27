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
    id: number,
    name: string,
    publicChannel: boolean,
    password: boolean,
    owner: number
  ) => this.channelModel.create({ id, name, publicChannel, password, owner });

  createChannelIfNotExist = async ({
    id,
    name,
    publicChannel,
    password,
    owner,
  }: {
    id: number;
    name: string;
    publicChannel: boolean;
    password: boolean;
    owner: number;
  }) => {
    const channel = await this.getChannel(id);
    if (!channel)
      return this.createChannel(id, name, publicChannel, password, owner);

    return channel;
  };

  getPubChannel = () => this.channelModel.findAll({ where: { public: true } });
  getChannel = (id: number) => this.channelModel.findByPk(id);
  findChannelByName = (name: string) => this.channelModel.findByPk(name);
}
