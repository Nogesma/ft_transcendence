import {
  AllowNull,
  Column,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from "sequelize-typescript";
import { User } from "../user/user.model.js";

@Table({ timestamps: false })
export class TFASecret extends Model {
  @ForeignKey(() => User)
  @PrimaryKey
  @Unique
  @Column
  user: number;

  @AllowNull(false)
  @Unique
  @Column
  secret: string;

  @AllowNull(false)
  @Default(true)
  @Column
  temp: boolean;
}
