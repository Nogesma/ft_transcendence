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
import { UserService } from "./user.service.js";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("me")
  async getUserData(@Req() req: Request) {
    return this.userService.getUserData(req.id);
  }

  @Get("2fa")
  async generateNew2FA(@Req() req: Request) {
    return this.userService.generateNew2FA(req.id);
  }

  @Post("2fa/:code")
  async validate2FA(@Req() req: Request, @Param("code") code: string) {
    return this.userService.validate2FA(req.id, code);
  }

  @Post("name")
  async postDisplayName(
    @Req() req: Request,
    @Body() body: { name: string | undefined }
  ) {
    if (!body.name)
      throw new HttpException("Missing name in body", HttpStatus.BAD_REQUEST);

    return this.userService.postDisplayName(req.id, body.name);
  }

  @Post("avatar")
  async postAvatar(@Req() req: Request, @Res() res: Response) {
    return this.userService.postAvatar(req, res, req.id);
  }
}
