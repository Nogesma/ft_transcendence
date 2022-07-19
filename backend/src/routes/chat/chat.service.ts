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
import { ChannelBanService } from "../../models/channelBan/channelBan.service.js";

@Injectable()
export class ChatService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
    private readonly userService: UserService,
    private readonly channelService: ChannelService,
    private readonly channelMemberService: ChannelMemberService,
    private readonly channelAdminService: ChannelAdminService,
    private readonly channelBanService: ChannelBanService
  ) {}

  getJoinedChannels = async (user: User) => {
    const channels = await user.$get("member");
    return map(pick(["name"]), channels);
  };

  getPublicChannels = async () => {
    const channels = await this.channelService.getPublicChannels();

    return map(pick(["name"]), channels);
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
    await this.channelMemberService.addMember(channel.id, id);

    return pick(["name"], channel);
  };

  deleteChannel = async (name: string, id: number) => {
    const channel = await this.channelService.getChannelByName(name);

    if (!channel)
      throw new HttpException("Channel does not exist", HttpStatus.BAD_REQUEST);

    if (id === channel.ownerId) await this.channelService.deleteChannel(name);
    else
      throw new HttpException(
        "Channel can only be deleted by it's owner",
        HttpStatus.FORBIDDEN
      );
  };

  /* Ban routes */
  banUser = async (
    oid: number,
    chan: string,
    userName: string,
    expires: Date
  ) => {
    const channel = await this.channelService.getChannelByName(chan);
    const user = await this.userService.getUserByLogin(userName);

    if (!channel || !user)
      throw new HttpException(
        "Channel or user not found",
        HttpStatus.BAD_REQUEST
      );

    //    if (await this.channelBanService.isBanned(user.id))
    //      throw new HttpException("User is already banned", HttpStatus.BAD_REQUEST);

    if (
      oid === channel.ownerId ||
      (await this.channelAdminService.getAdmin(channel.id, oid))
    ) {
      await this.channelBanService.banUser(channel.id, user.id, true, expires);
    } else
      throw new HttpException(
        "Member can only be banned by an admin",
        HttpStatus.FORBIDDEN
      );
  };

  unbanUser = async (oid: number, chan: string, userName: string) => {
    const channel = await this.channelService.getChannelByName(chan);
    const user = await this.userService.getUserByLogin(userName);

    if (!channel || !user)
      throw new HttpException(
        "Channel or user not found",
        HttpStatus.BAD_REQUEST
      );
    //   if (!(await this.channelBanService.isBanned(user.id)))
    //    throw new HttpException("User is not banned", HttpStatus.BAD_REQUEST);
    if (
      oid === channel.ownerId ||
      (await this.channelAdminService.getAdmin(channel.id, oid))
    ) {
      await this.channelBanService.unbanUser(channel.id, user.id, true);
    } else
      throw new HttpException(
        "Member can only be banned by an admin",
        HttpStatus.FORBIDDEN
      );
  };

  muteUser = async (
    oid: number,
    chan: string,
    userName: string,
    expires: Date
  ) => {
    const channel = await this.channelService.getChannelByName(chan);
    const user = await this.userService.getUserByName(userName);

    if (!channel || !user)
      throw new HttpException(
        "Channel or user not found",
        HttpStatus.BAD_REQUEST
      );

    if (await this.channelBanService.isMuted(user.id))
      throw new HttpException("User is already muted", HttpStatus.BAD_REQUEST);

    if (
      oid === channel.ownerId ||
      (await this.channelAdminService.getAdmin(channel.id, oid))
    ) {
      await this.channelBanService.banUser(channel.id, user.id, false, expires);
    } else
      throw new HttpException(
        "Member can only be banned by an admin",
        HttpStatus.FORBIDDEN
      );
  };

  unmuteUser = async (oid: number, chan: string, userName: string) => {
    const channel = await this.channelService.getChannelByName(chan);
    const user = await this.userService.getUserByName(userName);

    if (!channel || !user)
      throw new HttpException(
        "Channel or user not found",
        HttpStatus.BAD_REQUEST
      );
    if (!(await this.channelBanService.isMuted(user.id)))
      throw new HttpException("User is not muted", HttpStatus.BAD_REQUEST);
    if (
      oid === channel.ownerId ||
      (await this.channelAdminService.getAdmin(channel.id, oid))
    ) {
      await this.channelBanService.unbanUser(channel.id, user.id, false);
    } else
      throw new HttpException(
        "Member can only be banned by an admin",
        HttpStatus.FORBIDDEN
      );
  };

  isBanned = async (name: string, id: number) => {
    const channel = await this.channelService.getChannelByName(name);

    if (!channel)
      throw new HttpException("Channel not found", HttpStatus.BAD_REQUEST);
    return this.channelBanService.isBanned(id);
  };

  /* Admin routes */
  addAdmin = async (oid: number, chan: string, userName: string) => {
    const channel = await this.channelService.getChannelByName(chan);
    const user = await this.userService.getUserByName(userName);

    if (!channel || !user)
      throw new HttpException(
        "Channel or user not found",
        HttpStatus.BAD_REQUEST
      );

    if (oid === channel.ownerId) {
      await this.channelAdminService.addAdmin(channel.id, user.id);
    } else
      throw new HttpException(
        "Member can only be banned by an admin",
        HttpStatus.FORBIDDEN
      );
  };

  removeAdmin = async (oid: number, chan: string, userName: string) => {
    const channel = await this.channelService.getChannelByName(chan);
    const user = await this.userService.getUserByName(userName);

    if (!channel || !user)
      throw new HttpException(
        "Channel or user not found",
        HttpStatus.BAD_REQUEST
      );

    if (oid === channel.ownerId) {
      await this.channelAdminService.removeAdmin(channel.id, user.id);
    } else
      throw new HttpException(
        "Member can only be banned by an admin",
        HttpStatus.FORBIDDEN
      );
  };
}
