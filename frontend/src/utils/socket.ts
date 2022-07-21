import { io } from "socket.io-client";

const chatSocket = () =>
  io(`${import.meta.env.VITE_BACKEND_URI}/chat`, {
    withCredentials: true,
  });

const statusSocket = () =>
  io(`${import.meta.env.VITE_BACKEND_URI}/status`, {
    withCredentials: true,
  });

export { chatSocket, statusSocket };
