import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { UserService } from "../../models/user/user.service.js";
import {
  either,
  ifElse,
  isEmpty,
  isNil,
  lensProp,
  map,
  over,
  pick,
  pipe,
  prop,
} from "ramda";
import { ChannelService } from "../../models/channel/channel.service.js";
import { ChannelMemberService } from "../../models/channelMember/channelMember.service.js";
import { type User } from "../../models/user/user.model.js";
import { ChannelAdminService } from "../../models/channelAdmin/channelAdmin.service.js";
import { type Channel } from "../../models/channel/channel.model.js";

@Injectable()
export class ChatService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
    private readonly userService: UserService,
    private readonly channelService: ChannelService,
    private readonly channelMemberService: ChannelMemberService,
    private readonly channelAdminService: ChannelAdminService
  ) {}

  getJoinedChannels = async (user: User) => {
    const channels = await user.$get("member");
    // console.log(channels);
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
      const dec = await bcrypt.compare(password, channel.password);
      if (!dec)
        throw new HttpException("Wrong password", HttpStatus.UNAUTHORIZED);
    }
    await this.channelMemberService.addMember(channel.id, id);

    return true;
  };

  leaveChannel = async (name: string, id: number) => {
    const channel = await this.channelService.getChannelByName(name);

    if (!channel)
      throw new HttpException("Channel not found", HttpStatus.BAD_REQUEST);
    await this.channelMemberService.removeMember(channel.id, id);

    return true;
  };

  newChannel = ifElse(
    prop("pub"),
    this.channelService.createChannel,
    ifElse(
      pipe(prop("password"), either(isNil, isEmpty)),
      () => {
        throw new HttpException(
          "Password can not be empty",
          HttpStatus.BAD_REQUEST
        );
      },
      pipe<
        [
          {
            name: string;
            pub: boolean;
            ownerId: number;
            password: string;
          }
        ],
        {
          name: string;
          pub: boolean;
          ownerId: number;
          password: string;
        },
        Promise<Channel | void>
      >(
        over(lensProp("password"), (pass) => bcrypt.hashSync(pass, 10)),
        this.channelService.createChannel
      )
    )
  );

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

    const channel = await this.newChannel({ name, pub, ownerId: id, password });

    if (!channel) {
      throw new HttpException(
        "Could not create channel",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    await this.channelAdminService.addAdmin(channel.id, id);

    return pick(["name", "id"], channel);
  };

  deleteChannel = async (name: string, id: number) => {
    const channel = await this.channelService.getChannelByName(name);

    if (!channel)
      throw new HttpException("Channel does not exist", HttpStatus.BAD_REQUEST);
    if (id === channel.ownerId) {
      await this.channelService.deleteChannel(name);
    } else {
      throw new HttpException(
        "Only admins can delete c channel",
        HttpStatus.BAD_REQUEST
      );
    }
  };
}
