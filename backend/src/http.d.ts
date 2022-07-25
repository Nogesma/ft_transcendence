import type { Session } from "./models/session/session.model.js";
import type { Channel } from "./models/channel/channel.model.js";
import type { User } from "./models/user/user.model.js";
import type { Stats } from "./models/stats/stats.model.js";

declare module "http" {
  export interface IncomingMessage {
    session: Session;
    channels: Channel[];
    user: User;
    stats: Stats;
    signedCookies: { token: string };
  }
}
