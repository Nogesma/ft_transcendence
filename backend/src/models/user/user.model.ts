import {
  AllowNull,
  BelongsToMany,
  Column,
  Default,
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

  @AllowNull(false)
  @Default(false)
  @Column
  tfa: boolean;

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

  @BelongsToMany(() => Channel, () => ChannelMember)
  admin: Channel[];

  @BelongsToMany(() => Channel, () => ChannelBan)
  banned: Channel[];

  // @BelongsToMany(() => User, () => BlockedUser)
  // blocked: User[];
  //
  // @BelongsToMany(() => User, () => BlockedUser)
  // friend: User[];
}
