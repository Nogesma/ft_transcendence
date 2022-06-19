import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from "@nestjs/common";
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

    if (!token)
      throw new HttpException("Token not found", HttpStatus.UNAUTHORIZED);

    const session = (await getSession(token))?.toJSON();

    if (!session || !session.id || isExpired(session.expires))
      throw new HttpException("Invalid token", HttpStatus.UNAUTHORIZED);

    req.uid = session.id;
    next();
  }
}

const isExpired = (date: Date) => dayjs(date).isBefore(dayjs());
