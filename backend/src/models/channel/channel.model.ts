import {
  AllowNull,
  Column,
  ForeignKey,
  HasOne,
  Model,
  Table,
  Unique,
} from "sequelize-typescript";
import { User } from "../user/user.model.js";

@Table({ timestamps: false })
export class Channel extends Model {
  @AllowNull(false)
  @Unique
  @Column
  name: string;

  @AllowNull(false)
  @Column
  public: boolean;

  @Column
  password: string;

  @HasOne(() => User)
  @Column
  owner: number;
}
