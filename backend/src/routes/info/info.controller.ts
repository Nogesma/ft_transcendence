import { Controller, Get, Param } from "@nestjs/common";

import { InfoService } from "./info.service.js";

@Controller("info")
export class InfoController {
  constructor(private readonly infoService: InfoService) {}

  @Get(":id")
  async getUserInfo(@Param("id") id: number) {
    return this.infoService.getUserInfo(id);
  }

  @Get("stats/:id")
  async getUserStats(@Param("id") id: number) {
    return (await this.infoService.getUserStats(id)).toJSON();
  }

  @Get("/game/history/:id")
  async getGameHistory(@Param("id") id: number) {
    return this.infoService.getGameHistory(id);
  }
}
