import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Game } from "./game.model.js";
import { type User } from "../user/user.model.js";
import { StatsService } from "../stats/stats.service.js";
import dayjs from "dayjs";
import { getElo } from "../../utils/elo.js";

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Game)
    private gameModel: typeof Game,
    private readonly statsService: StatsService
  ) {}

  newGame = async (p1: User, p2: User, p1win: boolean) => {
    const date = dayjs();

    let p1Stats = await p1.$get("stats");
    let p2Stats = await p2.$get("stats");

    if (!p1Stats) p1Stats = await this.statsService.initStats(p1.id);
    if (!p2Stats) p2Stats = await this.statsService.initStats(p2.id);

    const scoreP1 = getElo(
      p1Stats.win + p1Stats.losses,
      p1Stats.highestElo,
      p1Stats.elo,
      p2Stats.elo,
      p1win
    );

    const scoreP2 = getElo(
      p2Stats.win + p2Stats.losses,
      p2Stats.highestElo,
      p2Stats.elo,
      p1Stats.elo,
      !p1win
    );

    await Promise.all([
      this.gameModel.create({
        win: p1win,
        playerElo: p1Stats.elo,
        opponentElo: p2Stats.elo,
        playerScore: scoreP1,
        opponentScore: scoreP2,
        playerId: p1.id,
        opponentId: p2.id,
        date,
      }),
      this.gameModel.create({
        win: !p1win,
        playerElo: p2Stats.elo,
        opponentElo: p1Stats.elo,
        playerScore: scoreP2,
        opponentScore: scoreP1,
        playerId: p2.id,
        opponentId: p1.id,
        date,
      }),
      this.statsService.updateStats(p1Stats, p2Stats, p1win, scoreP1),
      this.statsService.updateStats(p2Stats, p1Stats, !p1win, scoreP2),
    ]);
  };

  gameHistory = (playerId: number) =>
    this.gameModel.findAll({ where: { playerId }, order: [["date", "DESC"]] });
}
