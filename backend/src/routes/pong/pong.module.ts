import { Module } from "@nestjs/common";
import { PongController } from "./pong.controller.js";
import { PongService } from "./pong.service.js";
import { Game } from "./pong.service.js";

@Module({
  imports: [Game], //??
  controllers: [PongController],
  providers: [PongService],
})
export class PongModule {}
