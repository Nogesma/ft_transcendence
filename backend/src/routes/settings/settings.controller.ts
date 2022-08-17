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
import type { Request, Response } from "express";
import { SettingsService } from "./settings.service.js";
import { UserService } from "../../models/user/user.service.js";

@Controller("user")
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly userService: UserService
  ) {}

  @Get("me")
  async getUserData(@Req() req: Request) {
    const user = await req.session.$get("user");
    if (!user)
      throw new HttpException(
        "Could not find user",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    return this.settingsService.getUserData(user);
  }

  @Get("2fa")
  async get2FAStatus(@Req() req: Request) {
    return this.settingsService.get2FAStatus(req.session.userId);
  }

  @Get("2fa/enable")
  async generateNew2FA(@Req() req: Request) {
    const user = await req.session.$get("user");
    if (!user)
      throw new HttpException(
        "Could not find user",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    return this.settingsService.generateNew2FA(user);
  }

  @Post("2fa/validate/:code")
  async validate2FA(@Req() req: Request, @Param("code") code: string) {
    return this.settingsService.validate2FA(req.session.userId, code);
  }

  @Post("2fa/disable/:code")
  async disable2FA(@Req() req: Request, @Param("code") code: string) {
    return this.settingsService.disable2FA(req.session.userId, code);
  }

  @Post("name")
  async postDisplayName(
    @Req() req: Request,
    @Body() body: { name: string | undefined }
  ) {
    if (!body.name)
      throw new HttpException("Missing name in body", HttpStatus.BAD_REQUEST);

    return this.settingsService.postDisplayName(req.session.userId, body.name);
  }

  @Post("avatar")
  async postAvatar(@Req() req: Request, @Res() res: Response) {
    const login = (await req.session.$get("user"))?.login;
    if (!login)
      throw new HttpException(
        "Could not find user",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    return this.settingsService.postAvatar(req, res, login);
  }

  @Delete("avatar")
  async deleteAvatar(@Req() req: Request) {
    const login = (await req.session.$get("user"))?.login;
    if (!login)
      throw new HttpException(
        "Could not find user",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    return this.settingsService.deleteAvatar(req, login);
  }

  @Get("friends")
  async getFriendList(@Req() req: Request) {
    return this.settingsService.getFriendList(req.session.userId);
  }

  @Get("friend/requests")
  async getPendingFriendRequests(@Req() req: Request) {
    return this.settingsService.getPendingFriendRequests(req.session.userId);
  }

  @Post("friend/add/:name")
  async addFriend(@Req() req: Request, @Param("name") name: string) {
    const friend = await this.userService.getUserByLogin(name);

    if (!friend)
      throw new HttpException(
        "This user does not exists",
        HttpStatus.BAD_REQUEST
      );

    await this.settingsService.addFriend(req.session.userId, friend.id);
  }

  @Post("friend/requests/accept/:id")
  async acceptFriendRequest(@Req() req: Request, @Param("id") id: number) {
    await this.settingsService.acceptFriendRequest(req.session.userId, id);
  }

  @Post("friend/requests/deny/:id")
  async denyFriendRequest(@Req() req: Request, @Param("id") id: number) {
    await this.settingsService.denyFriendRequest(req.session.userId, id);
  }

  @Post("block/:id")
  async blockUser(@Req() req: Request, @Param("id") id: number) {
    await this.settingsService.block(req.session.userId, id);
  }

  @Post("unblock/:id")
  async unblockUser(@Req() req: Request, @Param("id") id: number) {
    await this.settingsService.unblock(req.session.userId, id);
  }
}
