import cookieParser from "cookie-parser";
import { NextFunction } from "express";
import { Socket } from "socket.io";

export interface ExtendedError extends Error {
  data?: never;
}

export default (cookieSecret: string) =>
  (socket: Socket, next: (err?: ExtendedError) => void) => {
    cookieParser(cookieSecret)(
      socket.request as never,
      null as never,
      next as NextFunction
    );
  };
