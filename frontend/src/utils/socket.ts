import { io } from "socket.io-client";

const backendUri = import.meta.env.VITE_BACKEND_URI;

const chatSocket = () =>
  io(`${backendUri}/chat`, {
    withCredentials: true,
  });

const pmSocket = () =>
  io(`${backendUri}/privatemessage`, {
    withCredentials: true,
  });

const statusSocket = () =>
  io(`${backendUri}/status`, {
    withCredentials: true,
  });

const gameSocket = () =>
  io(`${backendUri}/pong`, {
    withCredentials: true,
  });

export { chatSocket, statusSocket, gameSocket, pmSocket };
