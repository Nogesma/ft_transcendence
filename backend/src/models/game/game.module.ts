import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { GameService } from "./game.service.js";
import { Game } from "./game.model.js";
import { StatsModule } from "../stats/stats.module.js";
import { UserModule } from "../user/user.module.js";

@Module({
  imports: [SequelizeModule.forFeature([Game]), StatsModule, UserModule],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}
