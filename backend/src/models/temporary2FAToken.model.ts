import {
  AllowNull,
  Column,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from "sequelize-typescript";
import { User } from "./user.model.js";

@Table({ timestamps: false, tableName: "Temporary2FATokens" })
export class Temporary2FAToken extends Model {
  @ForeignKey(() => User)
  @PrimaryKey
  @Column
  id: number;

  @AllowNull(false)
  @Unique
  @Column
  token: string;

  @AllowNull(false)
  @Column
  expires: Date;
}
