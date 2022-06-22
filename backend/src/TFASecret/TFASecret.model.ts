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

@Table({ timestamps: false, tableName: "TwoFactorSecrets" })
export class TFASecret extends Model {
  @ForeignKey(() => User)
  @PrimaryKey
  @Column
  id: number;

  @AllowNull(false)
  @Unique
  @Column
  secret: string;

  @AllowNull(false)
  @Default(true)
  @Column
  temp: boolean;
}
