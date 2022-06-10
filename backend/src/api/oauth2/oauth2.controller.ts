import { Controller, HttpStatus, Param, Post, Req, Res } from "@nestjs/common";
import fetch, { FormData } from "node-fetch";
import { nanoid } from "nanoid";
import dayjs from "dayjs";
import speakeasy from "speakeasy";
import { response } from "express";

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

    if (has2FAEnabled(uid)) return create2FATemporaryToken(response, uid);

    return createUserSession(res, uid);
  }

  @Post("2fa/:code")
  async authenticate2FA(@Req() req, @Res() res, @Param() params) {
    const token = req?.cookies["2fa"];

    if (!token) return res.status(HttpStatus.UNAUTHORIZED).end();

    const uid = getUserBy2FAToken(token);
    if (!uid) return res.status(HttpStatus.UNAUTHORIZED).end();

    const { secret, retries } = getUser2FASecret(uid);

    const hasValidCode = speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token: params.code,
      window: 2,
      algorithm: "sha256",
    });

    // We return 401 if code is not valid, but keep the 2fa temporary token
    // in the database to allow for more tries.
    // One the number of retries reach 0, we send a 403.
    if (!hasValidCode) {
      if (retries == 0) return res.status(HttpStatus.FORBIDDEN).end();

      return res.status(HttpStatus.UNAUTHORIZED).end();
    }

    removeTemporary2FAToken(uid);

    return createUserSession(res, uid);
  }
}

const getUser2FASecret = (id) => {
  const [secret, retries] = ["abc", 1];

  if (retries == 1) removeTemporary2FAToken(id);
  updateTemporary2FAToken();

  return { secret, retries: retries - 1 };
};

const getUserBy2FAToken = (token) => {
  if (token === "abc") return 123;

  return null;
};

const createUserSession = (response, uid) => {
  const token = createSessionToken(uid);

  response.cookie("token", token, {
    expires: dayjs().add(1, "M").toDate(),
    sameSite: "strict",
  });

  response.end();
  response.status(HttpStatus.I_AM_A_TEAPOT).end();
};

const create2FATemporaryToken = (response, uid) => {
  const token = create2FAToken(uid);

  response.cookie("2fa", token, { sameSite: "strict" });
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
  return nanoid();
};

const has2FAEnabled = (id) => {
  id;
  // todo create user if not exist, add nanoid to session token table
  return true;
};
