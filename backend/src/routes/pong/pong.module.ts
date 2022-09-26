import { Module } from "@nestjs/common";
import { PongService } from "./pong.service.js";
import { PongGateway } from "./pong.gateway.js";
import { SessionModule } from "../../models/session/session.module.js";
import { GameModule } from "../../models/game/game.module.js";

@Module({
  imports: [SessionModule, GameModule],
  providers: [PongService, PongGateway],
})
export class PongModule {}
