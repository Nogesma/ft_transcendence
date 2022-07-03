import { Module } from "@nestjs/common";
import { GameService } from "./game.service.js";

@Module({
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}
