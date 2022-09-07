import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from "@nestjs/common";

import { InfoService } from "./info.service.js";
import { isNil } from "ramda";

@Controller("info")
export class InfoController {
  constructor(private readonly infoService: InfoService) {}

  @Get(":id")
  async getUserInfo(@Param("id") id: number) {
    if (isNaN(id))
      throw new HttpException("id is not a number", HttpStatus.BAD_REQUEST);

    return this.infoService.getUserInfo(id);
  }

  @Get("id/:name")
  async getUserId(@Param("name") name: string) {
    if (isNil(name))
      throw new HttpException("name is nil", HttpStatus.BAD_REQUEST);

    return this.infoService.getUserId(name);
  }

  @Get("stats/:id")
  async getUserStats(@Param("id") id: number) {
    if (isNaN(id))
      throw new HttpException("id is not a number", HttpStatus.BAD_REQUEST);

    return (await this.infoService.getUserStats(id)).toJSON();
  }

  @Get("/game/history/:id")
  async getGameHistory(@Param("id") id: number) {
    if (isNaN(id))
      throw new HttpException("id is not a number", HttpStatus.BAD_REQUEST);

    return this.infoService.getGameHistory(id);
  }
}
