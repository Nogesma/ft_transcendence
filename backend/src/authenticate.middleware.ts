import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from "@nestjs/common";
import dayjs from "dayjs";
import { NextFunction, Request, Response } from "express";
import { SessionService } from "./models/session/session.service.js";
import { Session } from "./models/session/session.model.js";

declare module "express" {
  export interface Request {
    session: Session;
  }
}

@Injectable()
export class AuthenticateMiddleware implements NestMiddleware {
  constructor(private readonly sessionService: SessionService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req?.signedCookies?.token;

    if (!token)
      throw new HttpException("Token not found", HttpStatus.UNAUTHORIZED);

    const session = await this.sessionService.getSession(token);

    if (!session || !session.id || isExpired(session.expires))
      throw new HttpException("Invalid token", HttpStatus.UNAUTHORIZED);

    req.session = session;
    next();
  }
}

const isExpired = (date: Date) => dayjs(date).isBefore(dayjs());
