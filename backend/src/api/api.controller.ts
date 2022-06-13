import {
  Controller,
  Get,
  HttpStatus,
  Req,
  Res,
  Post,
  Param,
} from "@nestjs/common";
import speakeasy from "speakeasy";
import {
  enableUser2FA,
  get2FASecret,
  getUser,
  set2FASecret,
  setPermanent2FASecret,
} from "../database/controller.js";

@Controller("api")
export class ApiController {
  @Get("me")
  async getUserData(@Req() req, @Res() res) {
    const uid = req?.uid;

    if (!uid) return res.status(HttpStatus.UNAUTHORIZED).end();

    console.log({ uid });
    const { username, displayname, image_url } = (await getUser(uid)).toJSON();

    res.json({ username, displayname, image_url }).end();
  }

  @Get("2fa")
  async generateNew2FA(@Req() req, @Res() res) {
    const uid = req?.uid;

    if (!uid) return res.status(HttpStatus.UNAUTHORIZED).end();

    const secret = speakeasy.generateSecret().base32;

    await set2FASecret(uid, secret);

    const otpauthURL = speakeasy.otpauthURL({
      secret: secret,
      encoding: "base32",
      algorithm: "sha512",
      label: await (await getUser(uid)).toJSON().login,
      issuer: "ft_transcendence",
    });

    res.json({ otpauthURL }).end();
  }

  @Post("2fa/:code")
  async validate2FA(@Req() req, @Res() res, @Param() params) {
    const uid = req?.uid;

    if (!uid) return res.status(HttpStatus.UNAUTHORIZED).end();

    const { secret } = (await get2FASecret(uid)).toJSON();

    const hasValidCode = speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token: params.code,
      window: 1,
      algorithm: "sha512",
    });

    if (!hasValidCode) return res.status(HttpStatus.UNAUTHORIZED).end();

    setPermanent2FASecret(uid);
    enableUser2FA(uid);

    res.end();
  }
}
