import axios from "axios";

const muteUser = (name: string, login: string, channel: string) => {
  if (name === login) {
    alert("You cannot mute yourself");
    return;
  }
  return axios.post(
    `${import.meta.env.VITE_BACKEND_URI}/api/chat/mute/${name}`,
    {
      name: channel,
      expires: new Date(),
    },
    {
      withCredentials: true,
    }
  );
};

const unmuteUser = (name: string, channel: string) =>
  axios.post(
    `${import.meta.env.VITE_BACKEND_URI}/api/chat/unmute/${name}`,
    {
      name: channel,
    },
    {
      withCredentials: true,
    }
  );

const unbanUser = (name: string, channel: string) =>
  axios.post(
    `${import.meta.env.VITE_BACKEND_URI}/api/chat/UnBan/${name}`,
    {
      name: channel,
    },
    {
      withCredentials: true,
    }
  );

const banUser = (name: string, login: string, channel: string) => {
  if (name === login) {
    alert("You cannot ban yourself");
    return;
  }
  return axios.post(
    `${import.meta.env.VITE_BACKEND_URI}/api/chat/ban/${name}`,
    {
      name: channel,
      expires: new Date(),
    },
    {
      withCredentials: true,
    }
  );
};

export { banUser, unbanUser, unmuteUser, muteUser };
