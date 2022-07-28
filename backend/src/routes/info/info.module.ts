import { Module } from "@nestjs/common";
import { InfoController } from "./info.controller.js";
import { InfoService } from "./info.service.js";
import { UserModule } from "../../models/user/user.module.js";
import { FriendModule } from "../../models/friend/friend.module.js";
import { BlockModule } from "../../models/block/block.module.js";
import { GameModule } from "../../models/game/game.module.js";
import { StatsModule } from "../../models/stats/stats.module.js";
import { InfoGateway } from "./info.gateway.js";
import { ConfigModule } from "@nestjs/config";
import { SessionModule } from "../../models/session/session.module.js";

@Module({
  imports: [
    UserModule,
    FriendModule,
    BlockModule,
    GameModule,
    StatsModule,
    ConfigModule,
    SessionModule,
  ],
  controllers: [InfoController],
  providers: [InfoService, InfoGateway],
})
export class InfoModule {}
