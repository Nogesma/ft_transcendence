import { Injectable } from "@nestjs/common";
import { Session } from "../models/session/session.model.js";
import { User } from "../models/user/user.model.js";
import { TFASession } from "../models/TFASession/TFASession.model.js";
import { TFASecret } from "../models/TFASecret/TFASecret.model.js";
import { Channel } from "../models/channel/channel.model.js";
import { ChannelBan } from "../models/channelBan/channelBan.model.js";

@Injectable()
export class DatabaseService {
  sync = () =>
    Promise.all([
      User.sync(),
      Session.sync(),
      TFASession.sync(),
      TFASecret.sync(),
      Channel.sync(),
      ChannelBan.sync(),
    ]);
}
