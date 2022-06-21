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
import speakeasy from "speakeasy";
import {
  enableUser2FA,
  get2FASecret,
  getUser,
  getUserName,
  set2FASecret,
  setPermanent2FASecret,
  updateUserName,
} from "../../database/controller.js";
import { fileTypeFromBuffer } from "file-type";
import busboy from "busboy";
import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import { UserService } from "./user.service.js";

@Controller("api/user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("me")
  async getUserData(@Req() req: Request) {
    return this.userService.getUserData(req.uid);
  }

  @Get("2fa")
  async generateNew2FA(@Req() req: Request, @Res() res: Response) {
    const uid = req.uid;

    const secret = speakeasy.generateSecret().base32;
    await set2FASecret(uid, secret);

    const login = await getUserName(uid);
    if (!login) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();

    const otpauthURL = speakeasy.otpauthURL({
      secret: secret,
      encoding: "base32",
      algorithm: "sha512",
      label: login,
      issuer: "ft_transcendence",
    });

    res.json({ otpauthURL }).end();
  }

  @Post("2fa/:code")
  async validate2FA(
    @Req() req: Request,
    @Res() res: Response,
    @Param("code") code: string
  ) {
    const uid = req.uid;

    const TFA = await get2FASecret(uid);
    if (!TFA) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
    const { secret } = TFA.toJSON();

    const hasValidCode = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token: code,
      window: 1,
      algorithm: "sha512",
    });

    if (!hasValidCode) return res.status(HttpStatus.UNAUTHORIZED).end();

    setPermanent2FASecret(uid);
    enableUser2FA(uid);

    res.end();
  }

  @Post("name")
  async postDisplayName(
    @Req() req: Request,
    @Body() body: { name: string | undefined }
  ) {
    if (!body.name)
      throw new HttpException("Missing name in body", HttpStatus.BAD_REQUEST);

    return this.userService.postDisplayName(req.uid, body.name);
  }

  @Post("avatar")
  async postAvatar(@Req() req: Request, @Res() res: Response) {
    return this.userService.postAvatar(req, res, req.uid);
  }
}
