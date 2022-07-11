import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Friend } from "./friend.model.js";
import { FriendService } from "./friend.service.js";

@Module({
  imports: [SequelizeModule.forFeature([Friend])],
  providers: [FriendService],
  exports: [FriendService],
})
export class FriendModule {}
