import { Column, ForeignKey, Model, Table, Unique } from "sequelize-typescript";
import { User } from "../user/user.model.js";

@Table({ timestamps: false })
export class Block extends Model {
  @ForeignKey(() => User)
  @Unique(false)
  @Column
  user: number;

  @ForeignKey(() => User)
  @Unique(false)
  @Column
  block: number;
}
