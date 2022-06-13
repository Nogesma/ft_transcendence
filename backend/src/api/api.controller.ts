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

@Controller("api")
export class ApiController {
  @Get("me")
  async getUserData(@Req() req, @Res() res) {
    const uid = req?.uid;

    if (uid === null) return res.status(HttpStatus.UNAUTHORIZED).end();

    const { username, displayname, image_url } = getUser(uid);

    res.json({ username, displayname, image_url }).end();
  }

  @Get("2fa")
  async generateNew2FA(@Req() req, @Res() res) {
    const uid = req?.uid;

    if (uid === null) return res.status(HttpStatus.UNAUTHORIZED).end();

    const secret = speakeasy.generateSecret().base32;

    setTemporary2FASecret(uid, secret);

    const otpauthURL = speakeasy.otpauthURL({
      secret: secret,
      encoding: "base32",
      algorithm: "sha512",
      label: getUser(1).username,
      issuer: "ft_transcendence",
    });

    res.json({ otpauthURL }).end();
  }

  @Post("2fa/:code")
  async validate2FA(@Req() req, @Res() res, @Param() params) {
    const uid = req?.uid;

    if (uid === null) return res.status(HttpStatus.UNAUTHORIZED).end();

    const { secret } = getTemporary2FASecret(uid);

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

// todo: actually fetch db to get username, displayname
const getUser = (id) => {
  id;
  return {
    username: "msegrans",
    displayname: "Mano Ségransan",
    image_url: "https://cdn.intra.42.fr/users/msegrans.jpg",
  };
};

const setTemporary2FASecret = (id, secret) => {
  id;
  secret;
};

const getTemporary2FASecret = (id) => {
  id;

  return { secret: "abc" };
};

const setPermanent2FASecret = (id) => {
  id;
};

const enableUser2FA = (id) => {
  id;
};
