import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { UserService } from "../../models/user/user.service.js";
import {
  andThen,
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
import type { User } from "../../models/user/user.model.js";
import { ChannelAdminService } from "../../models/channelAdmin/channelAdmin.service.js";
import type { Channel } from "../../models/channel/channel.model.js";
import { ChannelBanService } from "../../models/channelBan/channelBan.service.js";
import { FriendService } from "../../models/friend/friend.service.js";

@Injectable()
export class ChatService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
    private readonly userService: UserService,
    private readonly channelService: ChannelService,
    private readonly channelMemberService: ChannelMemberService,
    private readonly channelAdminService: ChannelAdminService,
    private readonly channelBanService: ChannelBanService,
    private readonly friendService: FriendService
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

    if (await this.channelBanService.isBanned(channel.id, id)) {
      throw new HttpException(
        "You are banned so go away",
        HttpStatus.FORBIDDEN
      );
    }

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

  is_admin = async (id: number, chan: string) => {
    const channel = await this.channelService.getChannelByName(chan);
    if (!channel)
      throw new HttpException("Channel not found", HttpStatus.BAD_REQUEST);
    if (channel.ownerId === id) return 2;
    return Number(
      Boolean(await this.channelAdminService.getAdmin(channel.id, id))
    );
  };

  getAdmins = async (id: number, chan: string) => {
    const channel = await this.channelService.getChannelByName(chan);
    if (!channel)
      throw new HttpException("Channel not found", HttpStatus.BAD_REQUEST);

    return pipe(
      () => channel.$get("admin"),
      andThen(map((x) => prop("id", x.toJSON())))
    )();
  };

  getMuted = async (id: number, chan: string) => {
    const channel = await this.channelService.getChannelByName(chan);
    if (!channel)
      throw new HttpException("Channel not found", HttpStatus.BAD_REQUEST);

    const channelMute = await this.channelBanService.getAllMuted(channel.id);
    if (!channelMute) return [];

    return map((x) => pick(["user", "expires"], x.toJSON()), channelMute);
  };

  getBans = async (id: number, chan: string) => {
    const channel = await this.channelService.getChannelByName(chan);
    if (!channel)
      throw new HttpException("Channel not found", HttpStatus.BAD_REQUEST);

    const channelBans = await this.channelBanService.getAllBanned(channel.id);
    if (!channelBans) return [];

    return map((x) => pick(["user", "expires"], x.toJSON()), channelBans);
  };

  ismuted = async (name: string, chan: string) => {
    const channel = await this.channelService.getChannelByName(chan);
    const user = await this.userService.getUserByLogin(name);
    if (!user) return;
    if (!channel)
      throw new HttpException("Channel not found", HttpStatus.BAD_REQUEST);
    return await this.channelBanService.isMuted(channel.id, user.id);
  };

  isBanned = async (name: string, chan: string) => {
    const channel = await this.channelService.getChannelByName(chan);
    const user = await this.userService.getUserByLogin(name);
    if (!user) return;
    if (!channel)
      throw new HttpException("Channel not found", HttpStatus.BAD_REQUEST);
    return await this.channelBanService.isBanned(channel.id, user.id);
  };

  /* Admin routes */
  addAdmin = async (oid: number, chan: string, userName: string) => {
    const channel = await this.channelService.getChannelByName(chan);
    const user = await this.userService.getUserByLogin(userName);
    if (!channel || !user)
      throw new HttpException(
        "Channel or user not found",
        HttpStatus.BAD_REQUEST
      );

    if (oid === channel.ownerId) {
      if (await this.channelAdminService.getAdmin(channel?.id, user.id)) {
        throw new HttpException(
          "User is already admin",
          HttpStatus.BAD_REQUEST
        );
      }

      await this.channelAdminService.addAdmin(channel.id, user.id);
    } else
      throw new HttpException(
        "Member can only be made admin by the owner",
        HttpStatus.FORBIDDEN
      );
  };

  removeAdmin = async (oid: number, chan: string, userName: string) => {
    const channel = await this.channelService.getChannelByName(chan);
    const user = await this.userService.getUserByLogin(userName);

    if (!channel || !user)
      throw new HttpException(
        "Channel or user not found",
        HttpStatus.BAD_REQUEST
      );
    if (oid === user.id) return;
    if (oid === channel.ownerId) {
      await this.channelAdminService.removeAdmin(channel.id, user.id);
    } else
      throw new HttpException(
        "Member can only be banned by an admin",
        HttpStatus.FORBIDDEN
      );
  };

  getPerms = async (id: number, chan: string, uid: number) => {
    const channel = await this.channelService.getChannelByName(chan);
    if (channel) {
      if (id === channel.ownerId) return true;

      const admins = await channel.$get("admin");

      if (admins.find((u) => u.id === id) && !admins.find((u) => u.id === uid))
        return true;
    }

    return false;
  };
}
