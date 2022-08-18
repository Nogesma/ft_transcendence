import type { Session } from "./models/session/session.model.js";
import type { Channel } from "./models/channel/channel.model.js";
import type { User } from "./models/user/user.model.js";
import type { Stats } from "./models/stats/stats.model.js";
import type { Socket } from "socket.io";
import { ChannelBan } from "../models/channelBan/channelBan.model.js";

// declare module "socket.io" {
//   export interface Socket["handshake"]> {
//     session: Session;
//     channels: Channel[];
//     user: User;
//     stats: Stats;
//   }
// }
//

export type AuthenticatedHandshake = {
  session: Session;
} & Socket["handshake"];

export type UserHandshake = {
  user: User;
} & AuthenticatedHandshake;

export type ChannelHandshake = {
  channels: Channel[];
  muted: Map<number, Date | null>;
} & UserHandshake;

export type StatsHandshake = {
  stats: Stats;
} & UserHandshake;

// export interface AuthenticatedHandshake
//   extends ReturnType<typeof Socket["handshake"]> {
//   session?: Session;
//   channels?: Channel[];
//   user?: User;
//   stats?: Stats;
// }
