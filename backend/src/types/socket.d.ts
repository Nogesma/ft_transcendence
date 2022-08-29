import type { Session } from "./models/session/session.model.js";
import type { Channel } from "./models/channel/channel.model.js";
import type { User } from "./models/user/user.model.js";
import type { Stats } from "./models/stats/stats.model.js";
import type { Socket } from "socket.io";

export type AuthenticatedHandshake = {
  session: Session;
} & Socket["handshake"];

export type UserHandshake = {
  user: User;
} & AuthenticatedHandshake;
export type BlockHandshake = {
  block: User[];
} & UserHandshake;
export type ChannelHandshake = {
  channels: Channel[];
  muted: Map<number, Date | null>;
} & UserHandshake;

export type StatsHandshake = {
  stats: Stats;
} & UserHandshake;
