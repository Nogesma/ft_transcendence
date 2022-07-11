import {
  Column,
  Default,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { User } from "../user/user.model.js";

@Table({ timestamps: false })
export class Friend extends Model {
  @ForeignKey(() => User)
  @Column
  user: number;

  @ForeignKey(() => User)
  @Column
  friend: number;

  @Default(false)
  @Column
  isFriend: boolean;
}
