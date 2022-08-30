import cookieParser from "cookie-parser";
import type { NextFunction, Request } from "express";
import type { Socket } from "socket.io";
import type { SessionService } from "../models/session/session.service.js";
import { isExpired } from "./date.js";
import type { SocketRequest } from "../types/http.js";
import type {
  AuthenticatedHandshake,
  BlockHandshake,
  ChannelHandshake,
  StatsHandshake,
  UserHandshake,
} from "../types/socket.js";
import { forEach, map, prop } from "ramda";
import type { Channel } from "../models/channel/channel.model.js";
import type { ChannelBanService } from "../models/channelBan/channelBan.service.js";

export interface ExtendedError extends Error {
  data?: never;
}

const socketAuth =
  (sessionService: SessionService) =>
  async (socket: Socket, next: (err?: ExtendedError) => void) => {
    const token = (socket.request as SocketRequest).signedCookies?.token;
    if (!token) return next(new Error("Token not found"));

    const session = await sessionService.getSession(token);
    if (!session || isExpired(session.expires))
      return next(new Error("Invalid token"));

    (socket.handshake as AuthenticatedHandshake).session = session;
    next();
  };

const addUser = async (socket: Socket, next: (err?: ExtendedError) => void) => {
  const handshake = socket.handshake as AuthenticatedHandshake;
  const user = await handshake.session?.$get("user");

  if (!user) return next(new Error("User not found"));

  (handshake as UserHandshake).user = user;
  next();
};

const addChannels =
  (channelBanService: ChannelBanService) =>
  async (socket: Socket, next: (err?: ExtendedError) => void) => {
    const handshake = socket.handshake as UserHandshake;
    const channels: Channel[] = await handshake.user?.$get("member");

    if (!channels) return next(new Error("User not in any channels"));

    (handshake as ChannelHandshake).channels = channels;
    (handshake as ChannelHandshake).muted = new Map();

    forEach(async (c) => {
      const user = await channelBanService.getUser(c.id, handshake.user.id);

      (handshake as ChannelHandshake).muted.set(
        c.id,
        user && !user.type ? user.expires : null
      );
    }, channels);
    next();
  };

const addStats = async (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => {
  const handshake = socket.handshake as UserHandshake;

  const stats = await handshake.user?.$get("stats");

  if (!stats) return next(new Error("User does not have stats"));

  (handshake as StatsHandshake).stats = stats;
  next();
};

const addBlock = async (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => {
  const handshake = socket.handshake as UserHandshake;

  const block = await handshake.user?.$get("blocked_by");

  if (!block) return next(new Error("User does not have block"));
  (handshake as BlockHandshake).block = new Set(map(prop("id"), block));
  next();
};

const socketCookieParser =
  (cookieSecret: string) =>
  (socket: Socket, next: (err?: ExtendedError) => void) =>
    cookieParser(cookieSecret)(
      socket.request as Request,
      null as never,
      next as NextFunction
    );

export {
  socketAuth,
  socketCookieParser,
  addUser,
  addChannels,
  addStats,
  addBlock,
};
