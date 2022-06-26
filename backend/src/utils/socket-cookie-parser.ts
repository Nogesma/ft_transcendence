import cookieParser from "cookie-parser";
import { Socket } from "socket.io";

export interface ExtendedError extends Error {
  data?: never;
}

export default (cookieSecret: string) =>
  (socket: Socket, next: (err?: ExtendedError) => void) => {
    // @ts-ignore
    cookieParser(cookieSecret)(socket.request, null, next);
  };
