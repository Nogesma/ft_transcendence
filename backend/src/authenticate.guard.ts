import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  SetMetadata,
} from "@nestjs/common";
import type { Session } from "./models/session/session.model.js";
import { isExpired } from "./utils/date.js";
import { SessionService } from "./models/session/session.service.js";
import { Reflector } from "@nestjs/core";

declare module "express" {
  export interface Request {
    session: Session;
  }
}

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly sessionService: SessionService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const req = context.switchToHttp().getRequest();

    const token = req?.signedCookies?.token;

    if (!token)
      throw new HttpException("Token not found", HttpStatus.UNAUTHORIZED);

    const session = await this.sessionService.getSession(token);

    if (!session || isExpired(session.expires))
      throw new HttpException("Invalid token", HttpStatus.UNAUTHORIZED);

    req.session = session;

    return true;
  }
}
