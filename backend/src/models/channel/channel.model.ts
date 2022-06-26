import {
  AllowNull,
  Column,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { User } from "../user/user.model.js";

@Table({ timestamps: false })
export class Channel extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Column
  id: number;

  @AllowNull(false)
  @Column
  name: string;

  @AllowNull(false)
  @Default(false)
  @Column
  publicChannel: boolean;

  @Default(false)
  @Column
  password: boolean;

  @ForeignKey(() => User)
  @PrimaryKey
  @Column
  owner: number;
}
