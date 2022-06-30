import {
  AllowNull,
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
  Unique,
} from "sequelize-typescript";
import { User } from "../user/user.model.js";

@Table({ timestamps: false })
export class Session extends Model {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: ReturnType<() => User>;

  @AllowNull(false)
  @Unique
  @Column
  token: string;

  @AllowNull(false)
  @Column
  expires: Date;
}
