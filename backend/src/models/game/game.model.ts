import {
  AllowNull,
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { User } from "../user/user.model.js";

@Table({ timestamps: false })
export class Game extends Model {
  @AllowNull(false)
  @Column
  win: boolean;

  @AllowNull(false)
  @Column
  playerElo: number;

  @AllowNull(false)
  @Column
  opponentElo: number;

  @AllowNull(false)
  @Column
  playerScore: number;

  @AllowNull(false)
  @Column
  opponentScore: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
  playerId: number;

  @BelongsTo(() => User, "playerId")
  player: ReturnType<() => User>;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
  opponentId: number;

  @BelongsTo(() => User, "opponentId")
  opponent: ReturnType<() => User>;

  @AllowNull(false)
  @Column
  date: Date;
}
