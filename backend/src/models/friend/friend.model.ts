import {
  AutoIncrement,
  Column,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { User } from "../user/user.model.js";

@Table({ timestamps: false })
export class Friend extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => User)
  @Column
  user: number;

  @ForeignKey(() => User)
  @Column
  friend: number;

  // 0 => friend not accepted, null => friend request sent, not accepted, 1 => friends
  @Column
  isFriend: boolean;
}
