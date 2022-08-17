import type { Socket } from "socket.io-client";

const acceptInvite = (
  socket: Socket,
  channel: string,
  { type, id }: { type: boolean; id: number }
) => socket.emit("acceptInvite", { channel, type, id });

const sendInvite = (socket: Socket, channel: string, type: boolean) =>
  socket.emit("sendInvite", { channel, type });

export { acceptInvite, sendInvite };
