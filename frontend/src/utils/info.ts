import axios from "axios";

const getUserInfo = (uid: number) =>
  axios
    .get(`${import.meta.env.VITE_BACKEND_URI}/api/info/${uid}`, {
      withCredentials: true,
    })
    .then(({ data }) => data)
    .catch(console.error);

const getUserStats = (uid: number) =>
  axios
    .get(`${import.meta.env.VITE_BACKEND_URI}/api/info/stats/${uid}`, {
      withCredentials: true,
    })
    .then(({ data }) => data)
    .catch(console.error);

export { getUserStats, getUserInfo };
