import {
  AllowNull,
  BelongsToMany,
  Column,
  HasMany,
  HasOne,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from "sequelize-typescript";
import { Channel } from "../channel/channel.model.js";
import { TFASession } from "../TFASession/TFASession.model.js";
import { TFASecret } from "../TFASecret/TFASecret.model.js";
import { Session } from "../session/session.model.js";
import { ChannelMember } from "../channelMember/channelMember.model.js";
import { ChannelBan } from "../channelBan/channelBan.model.js";
import { ChannelAdmin } from "../channelAdmin/channelAdmin.model.js";
import { Game } from "../game/game.model.js";
import { Stats } from "../stats/stats.model.js";
import { Friend } from "../friend/friend.model.js";
import { Block } from "../block/block.model.js";

@Table({ timestamps: false })
export class User extends Model {
  @PrimaryKey
  @Unique
  @AllowNull(false)
  @Column
  id: number;

  @AllowNull(false)
  @Column
  login: string;

  @AllowNull(false)
  @Column
  displayname: string;

  @HasMany(() => Session)
  session: Session[];

  @HasOne(() => TFASession)
  tfa_session: TFASession;

  @HasOne(() => TFASecret)
  tfa_secret: TFASecret;

  @HasMany(() => Channel)
  channels: Channel[];

  @BelongsToMany(() => Channel, () => ChannelMember)
  member: Channel[];

  @BelongsToMany(() => Channel, () => ChannelAdmin)
  admin: Channel[];

  @BelongsToMany(() => Channel, () => ChannelBan)
  banned: Channel[];

  @HasMany(() => Game, "playerId")
  games: Game[];

  @HasOne(() => Stats)
  stats: Stats;

  @BelongsToMany(() => User, () => Friend, "user")
  friend: User[];

  @BelongsToMany(() => User, () => Block, "user")
  block: User[];

  @BelongsToMany(() => User, () => Block, "block")
  blocked_by: User[];
}
