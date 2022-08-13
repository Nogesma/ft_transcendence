import axios from "axios";

const addFriend = (friendName: string) =>
  axios
    .post(
      `${import.meta.env.VITE_BACKEND_URI}/api/user/friend/add/${friendName}`,
      {},
      { withCredentials: true }
    )
    .then(() => ({
      message: `Friend request sent to ${friendName} !`,
      status: 0,
    }))
    .catch(({ response }) => ({
      message: response.data.message,
      status: 1,
    }));

const getPendingFriendRequests = (): Promise<number[]> =>
  axios
    .get(`${import.meta.env.VITE_BACKEND_URI}/api/user/friend/requests`, {
      withCredentials: true,
    })
    .then(({ data }) => data);

const acceptFriendRequest = (friendId: number) =>
  axios
    .post(
      `${import.meta.env.VITE_BACKEND_URI}/api/user/friend/accept/${friendId}`,
      {},
      {
        withCredentials: true,
      }
    )
    .then(({ data }) => data);

const denyFriendRequest = (friendId: number) =>
  axios
    .post(
      `${import.meta.env.VITE_BACKEND_URI}/api/user/friend/deny/${friendId}`,
      {},
      {
        withCredentials: true,
      }
    )
    .then(({ data }) => data);

const getFriendList = () =>
  axios
    .get(`${import.meta.env.VITE_BACKEND_URI}/api/user/friends`, {
      withCredentials: true,
    })
    .then(({ data }) => data);

export {
  addFriend,
  getPendingFriendRequests,
  acceptFriendRequest,
  denyFriendRequest,
  getFriendList,
};
