import { Injectable } from "@nestjs/common";
import { Session } from "../models/session/session.model.js";
import { User } from "../models/user/user.model.js";
import { TFASession } from "../models/TFASession/TFASession.model.js";
import { TFASecret } from "../models/TFASecret/TFASecret.model.js";
import { Channel } from "../models/channel/channel.model.js";
import { ChannelBan } from "../models/channelBan/channelBan.model.js";
import { ChannelMember } from "../models/channelMember/channelMember.model.js";
import { ChannelAdmin } from "../models/channelAdmin/channelAdmin.model.js";
import { Stats } from "../models/stats/stats.model.js";
import { Game } from "../models/game/game.model.js";
import { Friend } from "../models/friend/friend.model.js";
import { Block } from "../models/block/block.model.js";

// todo: disable alter for prod
@Injectable()
export class DatabaseService {
  sync = async () => {
    await User.sync({ alter: true });
    await Channel.sync({ alter: true });
    await Promise.all([
      Session.sync({ alter: true }),
      TFASession.sync({ alter: true }),
      TFASecret.sync({ alter: true }),
      ChannelMember.sync({ alter: true }),
      ChannelAdmin.sync({ alter: true }),
      ChannelBan.sync({ alter: true }),
      Game.sync({ alter: true }),
      Stats.sync({ alter: true }),
      Friend.sync({ alter: true }),
      Block.sync({ alter: true }),
    ]);
  };
}
