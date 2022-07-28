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

    socket.request.session = session;
    next();
  };

const addUser = async (socket: Socket, next: (err?: ExtendedError) => void) => {
  const user = await socket.client.request.session?.$get("user");

  if (!user) return next(new Error("User not found"));

  socket.request.user = user;
  next();
};

const addChannels = async (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => {
  const channels = await socket.request.user?.$get("member");

  if (!channels) return next(new Error("User not in any channels"));

  socket.request.channels = channels;
  next();
};

const addStats = async (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => {
  const stats = await socket.request.user?.$get("stats");

  if (!stats) return next(new Error("User does not have stats"));

  socket.request.stats = stats;
  next();
};

const socketCookieParser =
  (cookieSecret: string) =>
  (socket: Socket, next: (err?: ExtendedError) => void) =>
    cookieParser(cookieSecret)(
      socket.request as never,
      null as never,
      next as NextFunction
    );

export { socketAuth, socketCookieParser, addUser, addChannels, addStats };
