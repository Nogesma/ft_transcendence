import { Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { User } from "../user/user.model.js";
import { Channel } from "../channel/channel.model.js";

@Table({ timestamps: false })
export class ChannelMember extends Model {
  @ForeignKey(() => Channel)
  @Column
  chan: number;

  @ForeignKey(() => User)
  @Column
  user: number;
}
