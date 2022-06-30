import {
  AllowNull,
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
  @Column
  user: number;

  @AllowNull(false)
  @Unique
  @Column
  token: string;

  @AllowNull(false)
  @Column
  expires: Date;
}
