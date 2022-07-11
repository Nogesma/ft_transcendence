import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { StatsService } from "./stats.service.js";
import { Stats } from "./stats.model.js";

@Module({
  imports: [SequelizeModule.forFeature([Stats])],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
