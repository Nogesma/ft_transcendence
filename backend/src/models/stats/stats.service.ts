import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Stats } from "./stats.model.js";
import { getNewElo } from "../../utils/elo.js";

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

  updateStats = async (player: Stats, opponent: Stats, win: boolean) => {
    if (win) player.win++;
    else player.losses++;

    const newElo = getNewElo(
      player.win + player.losses,
      player.highestElo,
      player.elo,
      opponent.elo,
      win
    );

    if (newElo > player.highestElo) player.highestElo = newElo;

    player.elo = newElo;

    await player.save();
  };
}
