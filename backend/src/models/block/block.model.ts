import { Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { User } from "../user/user.model.js";

@Table({ timestamps: false })
export class Block extends Model {
  @ForeignKey(() => User)
  @Column
  user: number;

  @ForeignKey(() => User)
  @Column
  block: number;
}
