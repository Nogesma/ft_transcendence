import { Module } from "@nestjs/common";
import { InfoController } from "./info.controller.js";
import { InfoService } from "./info.service.js";
import { UserModule } from "../../models/user/user.module.js";
import { FriendModule } from "../../models/friend/friend.module.js";
import { BlockModule } from "../../models/block/block.module.js";
import { GameModule } from "../../models/game/game.module.js";

@Module({
  imports: [UserModule, FriendModule, BlockModule, GameModule],
  controllers: [InfoController],
  providers: [InfoService],
})
export class InfoModule {}
