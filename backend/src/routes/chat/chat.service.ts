import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UserService } from "../../models/user/user.service.js";
import { isEmpty, map, pick } from "ramda";
import { ChannelService } from "../../models/channel/channel.service.js";
import { ChannelMemberService } from "../../models/channelMember/channelMember.service.js";

@Injectable()
export class ChatService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
    private readonly userService: UserService,
    private readonly channelService: ChannelService,
    private readonly channelMemberService: ChannelMemberService
  ) {}

  getJoinedChannels = async (id: number) => {
    const channels = await this.channelMemberService.getAllChanMember(id);

    console.log(channels[0].user);
    return map(pick(["name", "id"]), channels);
  };

  getPublicChannels = async () => {
    const channels = await this.channelService.getPubblicChannels();

    return map(pick(["name", "id"]), channels);
  };

  joinChannel = async (
    name: string,
    pub: boolean,
    password: string,
    id: number
  ) => {
    const channel = await this.channelService.getChannelByName(name);

    if (!channel)
      throw new HttpException("Channel not found", HttpStatus.BAD_REQUEST);

    if (!channel.public) {
      if (password !== channel.password)
        throw new HttpException("Wrong password", HttpStatus.UNAUTHORIZED);
    }

    await this.channelMemberService.addMember(channel.id, id);

    return true;
  };

  createChannel = async (
    name: string,
    pub: boolean,
    password: string,
    id: number
  ) => {
    if (isEmpty(name) || name.match(/^\d/))
      throw new HttpException(
        "Channel name can not start with a digit",
        HttpStatus.BAD_REQUEST
      );

    if (!pub && !password)
      throw new HttpException(
        "Password can not be empty",
        HttpStatus.BAD_REQUEST
      );

    if (await this.channelService.getChannelByName(name))
      throw new HttpException("Channel already exist", HttpStatus.BAD_REQUEST);

    // todo: hash password

    const channel = await this.channelService.createChannel(
      name,
      pub,
      password,
      id
    );

    console.log(channel);
    console.log(pick(["name", "id"], channel));

    return pick(["name", "id"], channel);
  };
}
