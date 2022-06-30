import { AllowNull, Column, Model, Table, HasOne } from "sequelize-typescript";
import { User } from "../user/user.model.js";
import { Channel } from "../channel/channel.model.js";

@Table({ timestamps: false })
export class ChannelBan extends Model {
  @HasOne(() => Channel)
  chan: Channel;

  @HasOne(() => User)
  user: User;

  // type refers to ban (1) or mute (0)
  @AllowNull(false)
  @Column
  type: boolean;

  @AllowNull(false)
  @Column
  expires: Date;
}
