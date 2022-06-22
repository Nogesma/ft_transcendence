import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from "@nestjs/common";
import { getSession } from "./database/controller.js";
import dayjs from "dayjs";
import { NextFunction, Request, Response } from "express";

declare module "express" {
  export interface Request {
    id: number;
  }
}

@Injectable()
export class AuthenticateMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const token = req?.signedCookies?.token;

    if (!token)
      throw new HttpException("Token not found", HttpStatus.UNAUTHORIZED);

    const session = (await getSession(token))?.toJSON();

    if (!session || !session.id || isExpired(session.expires))
      throw new HttpException("Invalid token", HttpStatus.UNAUTHORIZED);

    req.id = session.id;
    next();
  }
}

const isExpired = (date: Date) => dayjs(date).isBefore(dayjs());
