import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Stats } from "./stats.model.js";

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Stats)
    private statsModel: typeof Stats
  ) {}

  initStats = async (userId: number) =>
    this.statsModel.create({
      win: 0,
      losses: 0,
      elo: 1000,
      highestElo: 1000,
      userId,
    });

  updateStats = async (
    player: Stats,
    opponent: Stats,
    win: boolean,
    score: number
  ) => {
    if (win) player.win++;
    else player.losses++;

    player.elo += score;

    if (player.elo > player.highestElo) player.highestElo = player.elo;

    await player.save();
  };

  getStats = async (userId: number) =>
    this.statsModel.findOne({ where: { userId } });
}
