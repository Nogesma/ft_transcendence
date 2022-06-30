import {
  AllowNull,
  BelongsTo,
  Column,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  Table,
  Unique,
} from "sequelize-typescript";
import { User } from "../user/user.model.js";
import { ChannelBan } from "../channelBan/channelBan.model.js";

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

  @ForeignKey(() => User)
  @Column
  ownerId: number;

  @BelongsTo(() => User)
  @Column
  owner: User;

  @HasMany(() => User)
  @Column
  admins: User[];

  @HasMany(() => User)
  @Column
  members: User[];

  @HasMany(() => ChannelBan)
  @Column
  ban: ChannelBan[];
}
