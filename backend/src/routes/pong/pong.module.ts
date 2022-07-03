import { Module } from "@nestjs/common";
import { GameModule } from "../../models/game/game.module.js";
import { PongController } from "./pong.controller.js";
import { PongService } from "./pong.service.js";

@Module({
  imports: [GameModule],
  controllers: [PongController],
  providers: [PongService],
})
export class PongModule {}
