import {
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import { Request, Response } from "express";
import { AuthService } from "./auth.service.js";

@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("oauth2/:code/:state")
  async addUser(
    @Res() res: Response,
    @Param("code") code: string,
    @Param("state") state: string
  ) {
    return this.authService.oauth2Handshake(res, code, state);
  }

  @Post("2fa/:code")
  async authenticate2FA(
    @Req() req: Request,
    @Res() res: Response,
    @Param("code") code: string
  ) {
    const token = req.signedCookies ? req.signedCookies["2fa"] : null;
    if (!token)
      throw new HttpException("2FA Token not found", HttpStatus.UNAUTHORIZED);

    return this.authService.authenticate2FA(res, token, code);
  }
}
