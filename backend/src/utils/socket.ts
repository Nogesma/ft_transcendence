import cookieParser from "cookie-parser";
import type { NextFunction } from "express";
import type { Socket } from "socket.io";
import type { SessionService } from "../models/session/session.service.js";
import { isExpired } from "./date.js";

export interface ExtendedError extends Error {
  data?: never;
}

const socketAuth =
  (sessionService: SessionService) =>
  async (socket: Socket, next: (err?: ExtendedError) => void) => {
    const token = socket.request.signedCookies?.token;
    if (!token) return next(new Error("Token not found"));

    const session = await sessionService.getSession(token);
    if (!session || isExpired(session.expires))
      return next(new Error("Invalid token"));

    const user = await session.$get("user");

    if (!user) return next(new Error("User not found"));

    socket.request.session = session;
    socket.request.user = user;
    next();
  };

const socketCookieParser =
  (cookieSecret: string) =>
  (socket: Socket, next: (err?: ExtendedError) => void) => {
    cookieParser(cookieSecret)(
      socket.request as never,
      null as never,
      next as NextFunction
    );
  };

export { socketAuth, socketCookieParser };
