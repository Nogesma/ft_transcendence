import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { default as axios } from "axios";
import {
  destroyTemporary2FAToken,
  get2FASecret,
  getTemporary2FAToken,
  getUser,
  new2FAToken,
  newSession,
  newUser,
} from "../../database/controller.js";
import { Response } from "express";
import { nanoid } from "nanoid";
import dayjs from "dayjs";
import speakeasy from "speakeasy";

@Injectable()
export class AuthService {
  async oauth2Handshake(res: Response, code: string, state: string) {
    const data = {
      redirect_uri: process.env.REDIRECT_URI,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "authorization_code",
      code: code,
      state: state,
    };

    const tokenResponse = await getOauthToken(data);

    if (!tokenResponse)
      throw new HttpException("42 Not Authorized", HttpStatus.UNAUTHORIZED);

    const { access_token } = tokenResponse;

    const userData = await get42UserData(access_token);

    if (!userData)
      throw new HttpException(
        "Unable to fetch user data from 42",
        HttpStatus.UNAUTHORIZED
      );

    const user = await createUser(userData);

    if (user.tfa) return create2FATemporaryToken(res, user.id);

    return createUserSession(res, user.id);
  }

  async authenticate2FA(res: Response, token: string, code: string) {
    const tempToken = (await getTemporary2FAToken(token))?.toJSON();
    if (!tempToken || isExpired(tempToken.expires))
      throw new HttpException(
        "2FA Token invalid or expired",
        HttpStatus.UNAUTHORIZED
      );

    const TFA = await get2FASecret(tempToken.id);
    if (!TFA)
      throw new HttpException(
        "Could not find 2FA Secret",
        HttpStatus.INTERNAL_SERVER_ERROR
      );

    const { secret, temp } = TFA.toJSON();
    if (temp === undefined || temp === null || temp || !secret)
      throw new HttpException("Invalid 2FA Secret", HttpStatus.UNAUTHORIZED);

    const hasValidCode = speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token: code,
      window: 1,
      algorithm: "sha512",
    });

    if (!hasValidCode)
      throw new HttpException("Invalid 2FA Code", HttpStatus.UNAUTHORIZED);

    await destroyTemporary2FAToken(tempToken.id);

    return createUserSession(res, tempToken.id);
  }
}

const getOauthToken = (data: {
  redirect_uri: string;
  client_id: string;
  client_secret: string;
  grant_type: string;
  code: string;
  state: string;
}) =>
  axios
    .post("https://api.intra.42.fr/oauth/token", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then(({ data }) => data)
    .catch(() => null);

const get42UserData = (token: string) =>
  axios
    .get("https://api.intra.42.fr/v2/me", {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    .then(({ data }) => data)
    .catch(() => null);

const createUser = async ({
  id,
  login,
  displayname,
}: {
  id: number;
  login: string;
  displayname: string;
}) => {
  const user = (await getUser(id))?.toJSON();

  if (!user) return newUser(id, login, displayname, false);

  return user;
};

const create2FATemporaryToken = async (response: Response, id: number) => {
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

const isExpired = (date: Date) => dayjs(date).isBefore(dayjs());

const createUserSession = async (response: Response, id: number) => {
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
