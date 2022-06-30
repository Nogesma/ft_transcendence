import {
  AllowNull,
  BelongsToMany,
  Column,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from "sequelize-typescript";
import { Channel } from "../channel/channel.model.js";

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

  @HasMany(() => Channel)
  @Column
  owned_channels: Channel[];

  @HasMany(() => Channel)
  @Column
  member_channels: Channel[];

  @HasMany(() => User)
  @Column
  blocked: User[];
}
