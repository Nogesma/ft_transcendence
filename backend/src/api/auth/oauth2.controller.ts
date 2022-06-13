import { Controller, HttpStatus, Param, Post, Req, Res } from "@nestjs/common";
import fetch, { FormData } from "node-fetch";
import { nanoid } from "nanoid";
import dayjs from "dayjs";
import speakeasy from "speakeasy";
import {
  destroyTemporary2FAToken,
  get2FASecret,
  getTemporary2FAToken,
  getUser,
  new2FAToken,
  newSession,
  newUser,
} from "../../database/controller.js";

@Controller("api/auth")
export class Oauth2Controller {
  @Post("oauth2/:code/:state")
  async addUser(@Res() res, @Param() params) {
    const data = new FormData();
    data.set("redirect_uri", process.env.REDIRECT_URI);
    data.set("client_id", process.env.CLIENT_ID);
    data.set("client_secret", process.env.CLIENT_SECRET);
    data.set("grant_type", "authorization_code");
    data.set("code", params.code);
    data.set("state", params.state);

    const tokenResponse = await getOauthToken<{ access_token: string }>(data);

    if (!tokenResponse) return res.status(HttpStatus.UNAUTHORIZED).end();

    const { access_token } = tokenResponse;

    const userData = await get42UserData<{
      id: number;
      login: string;
      displayname: string;
      image_url: string;
    }>(access_token);

    if (!userData) return res.status(HttpStatus.UNAUTHORIZED).end();

    const user = await createUser(userData);

    if (user.tfa) return create2FATemporaryToken(res, user.id);

    return createUserSession(res, user.id);
  }

  @Post("2fa/:code")
  async authenticate2FA(@Req() req, @Res() res, @Param() params) {
    const token = req.signedCookies ? req.signedCookies["2fa"] : null;

    if (!token) return res.status(HttpStatus.UNAUTHORIZED).end();

    const tempToken = (await getTemporary2FAToken(token)).toJSON();

    if (!tempToken || isExpired(tempToken.expires))
      return res.status(HttpStatus.UNAUTHORIZED).end();

    const { secret, temp } = (await get2FASecret(tempToken.id)).toJSON();

    if (temp) return res.status(HttpStatus.UNAUTHORIZED).end();

    const hasValidCode = speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token: params.code,
      window: 1,
      algorithm: "sha512",
    });

    if (!hasValidCode) return res.status(HttpStatus.UNAUTHORIZED).end();

    await destroyTemporary2FAToken(tempToken);

    return createUserSession(res, tempToken.id);
  }
}

const isExpired = (date) => dayjs(date).isBefore(dayjs());

const createUserSession = async (response, id) => {
  const token = nanoid();
  const expires = dayjs().add(1, "M").toDate();

  await newSession(id, token, expires);

  response.cookie("token", token, {
    expires,
    sameSite: "strict",
    signed: true,
    httpOnly: true,
  });

  response.end();
};

const create2FATemporaryToken = async (response, id) => {
  const token = nanoid();
  const expires = dayjs().add(10, "minutes").toDate();

  await new2FAToken(id, token, expires);

  response.cookie("2fa", token, {
    expires,
    sameSite: "strict",
    signed: true,
    httpOnly: true,
  });

  response.status(HttpStatus.I_AM_A_TEAPOT).end();
};

function getOauthToken<T>(body): Promise<T> | null {
  return fetch("https://api.intra.42.fr/oauth/token", {
    method: "POST",
    body,
  }).then((res) => {
    if (res.ok) return res.json() as Promise<T>;
    return null;
  });
}

function get42UserData<T>(token): Promise<T> | null {
  return fetch("https://api.intra.42.fr/v2/me", {
    headers: {
      authorization: `Bearer ${token}`,
    },
  }).then((res) => {
    if (res.ok) return res.json() as Promise<T>;
    return null;
  });
}

const createUser = async ({ id, login, displayname, image_url }) => {
  const user = (await getUser(id)).toJSON();

  if (!user) return newUser(id, login, displayname, image_url, false);

  return user;
};
