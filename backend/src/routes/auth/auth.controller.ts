import {
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import type { Request, Response } from "express";

import { AuthService } from "./auth.service.js";
import { Public } from "../../authenticate.guard.js";
import type { AuthenticatedRequest } from "../../types/http.js";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post("logout")
  async logout(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    await req.session.destroy();
    res.clearCookie("token");
    res.status(200).end();
  }

  @Public()
  @Post("oauth2/:code/:state")
  async addUser(
    @Res() res: Response,
    @Param("code") code: string,
    @Param("state") state: string
  ) {
    return this.authService.oauth2Handshake(res, code, state);
  }

  @Public()
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
