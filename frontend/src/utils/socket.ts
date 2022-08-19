import { io } from "socket.io-client";

const backendUri = import.meta.env.VITE_BACKEND_URI;

const getChatSocket = () =>
  io(`${backendUri}/chat`, {
    withCredentials: true,
  });

const getPmSocket = () =>
  io(`${backendUri}/privatemessage`, {
    withCredentials: true,
  });

const getGameSocket = () =>
  io(`${backendUri}/pong`, {
    withCredentials: true,
  });

export { getChatSocket, getGameSocket, getPmSocket };
