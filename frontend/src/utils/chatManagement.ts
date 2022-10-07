import type { Socket } from "socket.io-client";
import { curry } from "ramda";
import axios from "axios";

const muteUser = curry(
  (socket: Socket, channel: string, username: string, expires?: Date) =>
    socket.emit("muteUser", { channel, username, expires })
);

const unmuteUser = curry((socket: Socket, channel: string, username: string) =>
  socket.emit("unmuteUser", { channel, username })
);

const banUser = curry(
  (socket: Socket, channel: string, username: string, expires?: Date) =>
    socket.emit("banUser", { channel, username, expires })
);

const unbanUser = curry((socket: Socket, channel: string, username: string) =>
  socket.emit("unbanUser", { channel, username })
);

const addAdmin = curry((channel: string, name: string) =>
  axios
    .post(
      `${import.meta.env.VITE_BACKEND_URI}/api/chat/addAdmin/${name}`,
      {
        chan: channel,
      },
      {
        withCredentials: true,
      }
    )
    .catch(console.error)
);

const removeAdmin = curry((channel: string, name: string) =>
  axios
    .post(
      `${import.meta.env.VITE_BACKEND_URI}/api/chat/removeAdmin/${name}`,
      {
        chan: channel,
      },
      {
        withCredentials: true,
      }
    )
    .catch(console.error)
);

const isMuted = curry((channel: string, name: string) =>
  axios
    .post(
      `${import.meta.env.VITE_BACKEND_URI}/api/chat/isMuted/${name}`,
      {
        chan: channel,
      },
      {
        withCredentials: true,
      }
    )
    .catch(console.error)
);

const isAdmin = curry((channel: string, name: string) =>
  axios
    .post(
      `${import.meta.env.VITE_BACKEND_URI}/api/chat/isAdmin/${name}`,
      {
        chan: channel,
      },
      {
        withCredentials: true,
      }
    )
    .catch(console.error)
);

const isBanned = curry((channel: string, name: string) =>
  axios
    .post(
      `${import.meta.env.VITE_BACKEND_URI}/api/chat/isBanned/${name}`,
      {
        chan: channel,
      },
      {
        withCredentials: true,
      }
    )
    .catch(console.error)
);

const blockUser = (id: number) =>
  axios
    .post(
      `${import.meta.env.VITE_BACKEND_URI}/api/user/block/${id}`,
      {},
      { withCredentials: true }
    )
    .catch(console.error);

const unblockUser = (id: number) =>
  axios
    .post(
      `${import.meta.env.VITE_BACKEND_URI}/api/user/unblock/${id}`,
      {},
      { withCredentials: true }
    )
    .catch(console.error);

export {
  banUser,
  unbanUser,
  unmuteUser,
  muteUser,
  addAdmin,
  removeAdmin,
  isBanned,
  isMuted,
  isAdmin,
  blockUser,
  unblockUser,
};
