import {
  AllowNull,
  Column,
  Default,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from "sequelize-typescript";

@Table({ timestamps: false })
export class User extends Model {
  @PrimaryKey
  @Unique
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
