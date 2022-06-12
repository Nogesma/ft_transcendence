import { HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";

@Injectable()
export class AuthenticateMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const token = req?.signedCookies?.token;
    if (!(token && (req.uid = getUserByToken(token))))
      return res.status(HttpStatus.UNAUTHORIZED).end();
    next();
  }
}

// todo: actually get the user id by fetching the session db
const getUserByToken = (token) => {
  if (token === "abc") return 123;

  return null;
};
