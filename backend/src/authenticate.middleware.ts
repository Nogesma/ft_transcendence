import { HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { getSession } from "./database/controller.js";
import dayjs from "dayjs";

declare module "express" {
  export interface Request {
    uid: number;
  }
}

@Injectable()
export class AuthenticateMiddleware implements NestMiddleware {
  async use(req: any, res: any, next: () => void) {
    const token = req?.signedCookies?.token;

    if (!token) return res.status(HttpStatus.UNAUTHORIZED).end();

    const session = (await getSession(token))?.toJSON();

    if (!session || !session.id || isExpired(session.expires))
      return res.status(HttpStatus.UNAUTHORIZED).end();

    req.uid = session.id;
    next();
  }
}

const isExpired = (date: Date) => dayjs(date).isBefore(dayjs());
