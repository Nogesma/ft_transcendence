import type { Socket } from "socket.io-client";
import { curry } from "ramda";

const acceptInvite = curry(
  (
    socket: Socket,
    channel: string,
    { type, id }: { type: boolean; id: number }
  ) => socket.emit("acceptInvite", { channel, type, id })
);

const sendInvite = curry((socket: Socket, channel: string, type: boolean) =>
  socket.emit("sendInvite", { channel, type })
);

export { acceptInvite, sendInvite };
