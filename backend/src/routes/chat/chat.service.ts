import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { UserService } from "../../models/user/user.service.js";
import { isEmpty, map, pick } from "ramda";
import { ChannelService } from "../../models/channel/channel.service.js";
import { ChannelMemberService } from "../../models/channelMember/channelMember.service.js";
import { User } from "../../models/user/user.model.js";

@Injectable()
export class ChatService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
    private readonly userService: UserService,
    private readonly channelService: ChannelService,
    private readonly channelMemberService: ChannelMemberService
  ) {}

  getJoinedChannels = async (user: User) => {
    const channels = await user.$get("member");
    console.log(channels);
    return map(pick(["name", "id"]), channels);
  };

  getPublicChannels = async () => {
    const channels = await this.channelService.getPublicChannels();
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

    if (await this.channelService.getChannelByName(name))
      throw new HttpException("Channel already exist", HttpStatus.BAD_REQUEST);

    if (pub) {
      console.log({ name, pub, id });
      const channel = await this.channelService.createChannel(
        name,
        pub,
        id,
        undefined,
        undefined
      );

      return pick(["name", "id"], channel);
    } else {
      if (!password) {
        throw new HttpException(
          "Password can not be empty",
          HttpStatus.BAD_REQUEST
        );
      }
      password = await bcrypt.hash(password, 10);
      const channel = await this.channelService.createChannel(
        name,
        pub,
        id,
        password,
        undefined
      );

      return pick(["name", "id"], channel);
    }
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
      id,
      password,
      "test"
    );

    console.log(channel);
    console.log(pick(["name", "id"], channel));

    return pick(["name", "id"], channel);
  };
}
