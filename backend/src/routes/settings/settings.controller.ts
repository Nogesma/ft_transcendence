import {
  Controller,
  Get,
  HttpStatus,
  Req,
  Res,
  Post,
  Param,
  Body,
  HttpException,
} from "@nestjs/common";
import { Request, Response } from "express";
import { SettingsService } from "./settings.service.js";
import { ChannelService } from "../../models/channel/channel.service.js";

@Controller("user")
export class SettingsController {
  constructor(
    private readonly userService: SettingsService,
    private readonly channelService: ChannelService
  ) {}

  @Get("me")
  async getUserData(@Req() req: Request) {
    const user = await req.session.$get("user");
    if (!user)
      throw new HttpException(
        "Could not find user",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    return this.userService.getUserData(user);
  }

  @Get("2fa")
  async generateNew2FA(@Req() req: Request) {
    const user = await req.session.$get("user");
    if (!user)
      throw new HttpException(
        "Could not find user",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    return this.userService.generateNew2FA(user);
  }

  @Post("2fa/:code")
  async validate2FA(@Req() req: Request, @Param("code") code: string) {
    const user = await req.session.$get("user");
    if (!user)
      throw new HttpException(
        "Could not find user",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    return this.userService.validate2FA(user, code);
  }

  @Post("name")
  async postDisplayName(
    @Req() req: Request,
    @Body() body: { name: string | undefined }
  ) {
    if (!body.name)
      throw new HttpException("Missing name in body", HttpStatus.BAD_REQUEST);

    return this.userService.postDisplayName(req.session.userId, body.name);
  }

  @Post("avatar")
  async postAvatar(@Req() req: Request, @Res() res: Response) {
    const login = (await req.session.$get("user"))?.login;
    if (!login)
      throw new HttpException(
        "Could not find user",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    return this.userService.postAvatar(req, res, login);
  }
}
