import {
  AllowNull,
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
  Unique,
} from "sequelize-typescript";
import { User } from "../user/user.model.js";

@Table({ timestamps: false })
export class Stats extends Model {
  @AllowNull(false)
  @Column
  wins: number;

  @AllowNull(false)
  @Column
  losses: number;

  @AllowNull(false)
  @Column
  elo: number;

  @AllowNull(false)
  @Column
  highestElo: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Unique
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: ReturnType<() => User>;
}
