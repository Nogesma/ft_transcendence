import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Game } from "./game.model.js";
import { type User } from "../user/user.model.js";
import { StatsService } from "../stats/stats.service.js";

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Game)
    private gameModel: typeof Game,
    private readonly statsService: StatsService
  ) {}

  newGame = async (p1: User, p2: User, p1win: boolean) => {
    let p1Stats = await p1.$get("stats");
    let p2Stats = await p2.$get("stats");

    if (!p1Stats) p1Stats = await this.statsService.initStats(p1.id);
    if (!p2Stats) p2Stats = await this.statsService.initStats(p2.id);

    await Promise.all([
      this.gameModel.create({
        win: p1win,
        playerElo: p1Stats.elo,
        opponentElo: p2Stats.elo,
        playerId: p1.id,
        opponentId: p2.id,
      }),
      this.gameModel.create({
        win: !p1win,
        playerElo: p2Stats.elo,
        opponentElo: p1Stats.elo,
        playerId: p2.id,
        opponentId: p1.id,
      }),
      this.statsService.updateStats(p1Stats, p2Stats, p1win),
      this.statsService.updateStats(p2Stats, p1Stats, !p1win),
    ]);
  };
}
