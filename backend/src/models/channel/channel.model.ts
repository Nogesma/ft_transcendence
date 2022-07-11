import {
  AllowNull,
  BelongsTo,
  BelongsToMany,
  Column,
  ForeignKey,
  Model,
  Table,
  Unique,
} from "sequelize-typescript";
import { User } from "../user/user.model.js";
import { ChannelMember } from "../channelMember/channelMember.model.js";
import { ChannelBan } from "../channelBan/channelBan.model.js";
import { ChannelAdmin } from "../channelAdmin/channelAdmin.model.js";

@Table({ timestamps: false })
export class Channel extends Model {
  @AllowNull(false)
  @Unique
  @Column
  name: string;

  @AllowNull(false)
  @Column
  public: boolean;

  @Column
  password: string;

  @Column
  salt: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
  ownerId: number;

  @BelongsTo(() => User)
  owner: ReturnType<() => User>;

  @BelongsToMany(() => User, () => ChannelMember)
  members: User[];

  @BelongsToMany(() => User, () => ChannelAdmin)
  admin: User[];

  @BelongsToMany(() => User, () => ChannelBan)
  bans: User[];
}
