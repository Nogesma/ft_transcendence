import { Controller, HttpStatus, Param, Post, Req, Res } from "@nestjs/common";
import fetch, { FormData } from "node-fetch";
import { nanoid } from "nanoid";
import dayjs from "dayjs";
import speakeasy from "speakeasy";

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

    if (tokenResponse === null)
      return res.status(HttpStatus.UNAUTHORIZED).end();

    const { access_token } = tokenResponse;

    const userData = await get42UserData<{
      id: number;
      login: string;
      displayname: string;
      image_url: string;
    }>(access_token);

    if (userData === null) return res.status(HttpStatus.UNAUTHORIZED).end();

    const uid = createUser(userData);

    if (has2FAEnabled(uid)) return create2FATemporaryToken(res, uid);

    return createUserSession(res, uid);
  }

  @Post("2fa/:code")
  async authenticate2FA(@Req() req, @Res() res, @Param() params) {
    const token = req.signedCookies ? req.signedCookies["2fa"] : null;

    if (!token) return res.status(HttpStatus.UNAUTHORIZED).end();

    const uid = getUserBy2FAToken(token);
    if (!uid) return res.status(HttpStatus.UNAUTHORIZED).end();

    const { secret } = getUser2FASecret(uid);

    const hasValidCode = speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token: params.code,
      window: 1,
      algorithm: "sha512",
    });

    if (!hasValidCode) return res.status(HttpStatus.UNAUTHORIZED).end();

    removeTemporary2FAToken(uid);

    return createUserSession(res, uid);
  }
}

const getUser2FASecret = (id) => {
  const [secret] = ["abc"];

  return { secret };
};

const removeTemporary2FAToken = (id) => {
  id;
};

const getUserBy2FAToken = (token) => {
  if (token === "abc") return 123;

  return null;
};

const createUserSession = (response, uid) => {
  const { token, expires } = createSessionToken(uid);

  response.cookie("token", token, {
    expires,
    sameSite: "strict",
    signed: true,
    httpOnly: true,
  });

  response.end();
};

const create2FAToken = (id) => {
  id;

  return { token: nanoid(), expires: dayjs().add(10, "minutes").toDate() };
};

const create2FATemporaryToken = (response, uid) => {
  const { token, expires } = create2FAToken(uid);

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

/** We should only use id/login to authenticate user, as all other fields can be modified */
const createUser = ({ id, login, displayname, image_url }) => {
  id;
  login;
  displayname;
  image_url;
  return id;
};

const createSessionToken = (id) => {
  id;
  // todo create user if not exist, add nanoid to session token table

  return { token: nanoid(), expires: dayjs().add(1, "M").toDate() };
};

const has2FAEnabled = (id) => {
  id;
  // todo create user if not exist, add nanoid to session token table
  return true;
};
