import { Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { User } from "../user/user.model.js";

@Table({ timestamps: false })
export class BlockedUser extends Model {
  @ForeignKey(() => User)
  @Column
  user1: ReturnType<() => User>;

  @ForeignKey(() => User)
  @Column
  user2: ReturnType<() => User>;
}
