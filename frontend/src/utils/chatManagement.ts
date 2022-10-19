import type { Socket } from "socket.io-client";
import { curry } from "ramda";
import axios from "axios";
import { blocks } from "../stores/settings";

const muteUser = curry(
  (socket: Socket, channel: string, username: string, expires: Date) =>
    socket.emit("muteUser", { channel, username, expires })
);

const unmuteUser = curry((socket: Socket, channel: string, username: string) =>
  socket.emit("unmuteUser", { channel, username })
);

const banUser = curry(
  (socket: Socket, channel: string, username: string, expires: Date) =>
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
    .then(({ data }) => data)
    .catch(console.error)
);

const removeAdmin = (channel: string, name: string) =>
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
    .then(({ data }) => data)
    .catch(console.error);

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

const isAdmin = curry((channel: string) =>
  axios
    .get(`${import.meta.env.VITE_BACKEND_URI}/api/chat/isAdmin/${channel}`, {
      withCredentials: true,
    })
    .then(({ data }) => data)
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
    .then(() => {
      blocks.update((b) => {
        b.add(id);
        return b;
      });
    })
    .catch(console.error);

const unblockUser = (id: number) =>
  axios
    .post(
      `${import.meta.env.VITE_BACKEND_URI}/api/user/unblock/${id}`,
      {},
      { withCredentials: true }
    )
    .then(() => {
      blocks.update((b) => {
        b.delete(id);
        return b;
      });
    })
    .catch(console.error);

const hasAdminRights = (uid: number, chan: string) =>
  axios
    .get(`${import.meta.env.VITE_BACKEND_URI}/api/chat/perms/${uid}/${chan}`, {
      withCredentials: true,
    })
    .then(({ data }) => data)
    .catch(console.error);

const getAdminList = (chan: string) =>
  axios
    .get(`${import.meta.env.VITE_BACKEND_URI}/api/chat/admins/${chan}`, {
      withCredentials: true,
    })
    .then(({ data }) => data)
    .catch(console.error);

const getMuteList = (chan: string) =>
  axios
    .get(`${import.meta.env.VITE_BACKEND_URI}/api/chat/muted/${chan}`, {
      withCredentials: true,
    })
    .then(({ data }) => data)
    .catch(console.error);

const getBanList = (chan: string) =>
  axios
    .get(`${import.meta.env.VITE_BACKEND_URI}/api/chat/bans/${chan}`, {
      withCredentials: true,
    })
    .then(({ data }) => data)
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
  hasAdminRights,
  getAdminList,
  getMuteList,
  getBanList,
};
