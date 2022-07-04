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
    ownerId: number,
    password: string | undefined,
    salt: string | undefined
  ) => this.channelModel.create({ name, public: pub, ownerId, password, salt });

  createChannelIfNotExist = async (
    name: string,
    pub: boolean,
    ownerId: number,
    password: string | undefined,
    salt: string | undefined
  ) => {
    const channel = await this.findChannelByName(name);
    if (!channel) return this.createChannel(name, pub, ownerId, password, salt);

  getChannelById = (id: number) => this.channelModel.findByPk(id);

  getChannelByName = (name: string) =>
    this.channelModel.findOne({ where: { name } });

  findChannelByName = (name: string) => this.channelModel.findByPk(name);
}
