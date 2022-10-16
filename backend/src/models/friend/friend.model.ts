import {
  AutoIncrement,
  Column,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from "sequelize-typescript";
import { User } from "../user/user.model.js";

@Table({ timestamps: false })
export class Friend extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => User)
  @Unique(false)
  @Column
  user: number;

  @ForeignKey(() => User)
  @Unique(false)
  @Column
  friend: number;

  // 0 => friend not accepted, null => friend request sent, not accepted, 1 => friends
  @Column
  isFriend: boolean;
}
