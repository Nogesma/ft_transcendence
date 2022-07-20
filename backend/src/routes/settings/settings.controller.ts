import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
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
  async get2FAStatus(@Req() req: Request) {
    return this.userService.get2FAStatus(req.session.userId);
  }

  @Get("2fa/enable")
  async generateNew2FA(@Req() req: Request) {
    const user = await req.session.$get("user");
    if (!user)
      throw new HttpException(
        "Could not find user",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    return this.userService.generateNew2FA(user);
  }

  @Post("2fa/validate/:code")
  async validate2FA(@Req() req: Request, @Param("code") code: string) {
    return this.userService.validate2FA(req.session.userId, code);
  }

  @Post("2fa/disable/:code")
  async disable2FA(@Req() req: Request, @Param("code") code: string) {
    return this.userService.disable2FA(req.session.userId, code);
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

  @Delete("avatar")
  async deleteAvatar(@Req() req: Request) {
    const login = (await req.session.$get("user"))?.login;
    if (!login)
      throw new HttpException(
        "Could not find user",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    return this.userService.deleteAvatar(req, login);
  }

  @Get("friend/requests")
  async getPendingFriendRequests(@Req() req: Request) {
    return this.userService.getPendingFriendRequests(req.session.userId);
  }

  @Post("friend/add/:id")
  async addFriend(@Req() req: Request, @Param("id") id: number) {
    await this.userService.addFriend(req.session.userId, id);
  }

  @Post("friend/requests/accept/:id")
  async acceptFriendRequest(@Req() req: Request, @Param("id") id: number) {
    await this.userService.acceptFriendRequest(req.session.userId, id);
  }

  @Post("friend/requests/deny/:id")
  async denyFriendRequest(@Req() req: Request, @Param("id") id: number) {
    await this.userService.denyFriendRequest(req.session.userId, id);
  }

  @Post("block/:id")
  async blockUser(@Req() req: Request, @Param("id") id: number) {
    await this.userService.block(req.session.userId, id);
  }

  @Post("unblock/:id")
  async unblockUser(@Req() req: Request, @Param("id") id: number) {
    await this.userService.unblock(req.session.userId, id);
  }
}
