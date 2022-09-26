import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Game } from "./game.model.js";
import { StatsService } from "../stats/stats.service.js";
import dayjs from "dayjs";
import { getElo } from "../../utils/elo.js";
import { UserService } from "../user/user.service.js";

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Game)
    private gameModel: typeof Game,
    private readonly statsService: StatsService,
    private readonly userService: UserService
  ) {}

  newGame = async (p1: number, p2: number, p1win: boolean) => {
    const date = dayjs();
    const p1User = await this.userService.getUser(p1);
    const p2User = await this.userService.getUser(p2);

    if (!p1User || !p2User) throw new Error("User does not exist");

    const p1Stats = await p1User.$get("stats");
    const p2Stats = await p2User.$get("stats");

    if (!p1Stats || !p2Stats) throw new Error("User does not have stats");

    const scoreP1 = getElo(
      p1Stats.wins + p1Stats.losses,
      p1Stats.highestElo,
      p1Stats.elo,
      p2Stats.elo,
      p1win
    );

    const scoreP2 = getElo(
      p2Stats.wins + p2Stats.losses,
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
        playerId: p1,
        opponentId: p2,
        date,
      }),
      this.gameModel.create({
        win: !p1win,
        playerElo: p2Stats.elo,
        opponentElo: p1Stats.elo,
        playerScore: scoreP2,
        opponentScore: scoreP1,
        playerId: p2,
        opponentId: p1,
        date,
      }),
      this.statsService.updateStats(p1Stats, p2Stats, p1win, scoreP1),
      this.statsService.updateStats(p2Stats, p1Stats, !p1win, scoreP2),
    ]);
  };

  gameHistory = (playerId: number) =>
    this.gameModel.findAll({ where: { playerId }, order: [["date", "DESC"]] });
}
