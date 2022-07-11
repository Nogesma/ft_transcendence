import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "./user.model.js";
import { UserService } from "./user.service.js";
import { StatsModule } from "../stats/stats.module.js";

@Module({
  imports: [SequelizeModule.forFeature([User]), StatsModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
