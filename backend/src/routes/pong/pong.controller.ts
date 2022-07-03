import { Controller, Get, Param } from "@nestjs/common";
import { PongService } from "./pong.service.js";

@Controller("pong")
export class PongController {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(private readonly pong_service: PongService) {}

  @Get("game/new")
  async newGame() {
    return this.pong_service.newGame();
  }

  @Get("game/:id")
  async getGame(@Param("id") id: string) {
    return this.pong_service.getGame(id);
  }
}
