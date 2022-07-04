import {
  AllowNull,
  Column,
  Model,
  Table,
  ForeignKey,
} from "sequelize-typescript";
import { User } from "../user/user.model.js";
import { Channel } from "../channel/channel.model.js";

@Table({ timestamps: false })
export class ChannelBan extends Model {
  @ForeignKey(() => Channel)
  @Column
  chan: number;

  @ForeignKey(() => User)
  @Column
  user: number;

  // type refers to ban (1) or mute (0)
  @AllowNull(false)
  @Column
  type: boolean;

  @AllowNull(false)
  @Column
  expires: Date;
}
