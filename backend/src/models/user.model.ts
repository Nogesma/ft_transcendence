import {
  AllowNull,
  Column,
  Default,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";

@Table({ timestamps: false, tableName: "Users" })
export class User extends Model {
  @PrimaryKey
  @AllowNull(false)
  @Column
  id: number;

  @AllowNull(false)
  @Column
  login: string;

  @AllowNull(false)
  @Column
  displayname: string;

  @AllowNull(false)
  @Default(false)
  @Column
  tfa: boolean;
}
