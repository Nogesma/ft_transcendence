import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { BlockedUser } from "./blockedUser.model.js";
import { BlockedUserService } from "./blockedUser.service.js";

@Module({
  imports: [SequelizeModule.forFeature([BlockedUser])],
  providers: [BlockedUserService],
  exports: [BlockedUserService],
})
export class BlockedUserModule {}
