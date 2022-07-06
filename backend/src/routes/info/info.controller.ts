import { Controller, Get, Param } from "@nestjs/common";

import { InfoService } from "./info.service.js";

@Controller("info")
export class InfoController {
  constructor(private readonly infoService: InfoService) {}

  @Get(":id")
  async getUserData(@Param("id") id: number) {
    return this.infoService.getUserData(id);
  }

  @Get("/game/history/:id")
  async getGameHistory(@Param("id") id: number) {
    return this.infoService.getGameHistory(id);
  }
}
