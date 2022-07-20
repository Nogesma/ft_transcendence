import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { default as axios } from "axios";
import { Response } from "express";
import { nanoid } from "nanoid";
import dayjs from "dayjs";
import speakeasy from "speakeasy";
import { ConfigService } from "@nestjs/config";
import { UserService } from "../../models/user/user.service.js";
import { SessionService } from "../../models/session/session.service.js";
import { TFASessionService } from "../../models/TFASession/TFASession.service.js";
import { type User } from "../../models/user/user.model.js";
import { SettingsService } from "../settings/settings.service.js";

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly tfaSessionService: TFASessionService,
    private readonly settingsService: SettingsService
  ) {}

  oauth2Handshake = async (res: Response, code: string, state: string) => {
    const data = {
      redirect_uri: this.configService.get("REDIRECT_URI"),
      client_id: this.configService.get("CLIENT_ID"),
      client_secret: this.configService.get("CLIENT_SECRET"),
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

    const user = await this.userService.createUserIfNotExist(userData);

    if (await this.settingsService.get2FAStatus(user.id))
      return this.createTFASession(res, user.id);

    return this.createUserSession(res, user);
  };

  authenticate2FA = async (res: Response, token: string, code: string) => {
    const tfaSession = await this.tfaSessionService.getTFASession(token);
    if (!tfaSession || isExpired(tfaSession.expires))
      throw new HttpException(
        "2FA Token invalid or expired",
        HttpStatus.UNAUTHORIZED
      );

    const user = await tfaSession.$get("user");
    if (!user)
      throw new HttpException(
        "Could not find user",
        HttpStatus.INTERNAL_SERVER_ERROR
      );

    const TFA = await user.$get("tfa_secret");
    if (!TFA)
      throw new HttpException(
        "Could not find 2FA Secret",
        HttpStatus.INTERNAL_SERVER_ERROR
      );

    const { secret, temp } = TFA;
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

    await tfaSession.destroy();
    res.clearCookie("2fa");

    return this.createUserSession(res, user);
  };
  createUserSession = async (response: Response, user: User) => {
    const token = nanoid();
    const expires = dayjs().add(1, "M").toDate();

    await this.sessionService.createSession(user, token, expires);

    response.cookie("token", token, {
      expires,
      sameSite: "strict",
      signed: true,
      httpOnly: true,
    });

    response.end();
  };

  createTFASession = async (response: Response, id: number) => {
    const token = nanoid();
    const expires = dayjs().add(10, "minutes").toDate();

    await this.tfaSessionService.createTFASession(id, token, expires);

    response.cookie("2fa", token, {
      expires,
      sameSite: "strict",
      signed: true,
      httpOnly: true,
    });

    response.status(HttpStatus.I_AM_A_TEAPOT).end();
  };
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

const isExpired = (date: Date) => dayjs(date).isBefore(dayjs());
