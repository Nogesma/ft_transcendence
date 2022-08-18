import type { Session } from "./models/session/session.model.js";
import type { Request } from "express";
import type { IncomingMessage } from "http";

export interface AuthenticatedRequest extends Request {
  session: Session;
}

export interface SocketRequest extends IncomingMessage {
  signedCookies: { token: string };
}

//
// declare module "http" {
//   export interface IncomingMessage {
//     session: Session;
//     channels: Channel[];
//     user: User;
//     stats: Stats;
//     signedCookies: { token: string };
//   }
// }
