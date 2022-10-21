import axios from "axios";
import { friends, pendingFriends } from "../stores/settings";

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

const delFriend = (id: number) => {
  axios
    .post(
      `${import.meta.env.VITE_BACKEND_URI}/api/user/friend/del/${id}`,
      {},
      { withCredentials: true }
    )
    .then(() => {
      friends.update((f) => {
        f.delete(id);
        return f;
      });
    })
    .catch(console.error);
};

const getPendingFriendRequests = (): Promise<number[]> =>
  axios
    .get(`${import.meta.env.VITE_BACKEND_URI}/api/user/friend/requests`, {
      withCredentials: true,
    })
    .then(({ data }) => data)
    .catch(console.error);

const acceptFriendRequest = (friendId: number) =>
  axios
    .post(
      `${
        import.meta.env.VITE_BACKEND_URI
      }/api/user/friend/requests/accept/${friendId}`,
      {},
      {
        withCredentials: true,
      }
    )
    .then(({ data }) => {
      pendingFriends.update((f) => {
        f.delete(friendId);
        return f;
      });
      friends.update((f) => {
        f.add(friendId);
        return f;
      });
      return data;
    })
    .catch(console.error);

const denyFriendRequest = (friendId: number) =>
  axios
    .post(
      `${
        import.meta.env.VITE_BACKEND_URI
      }/api/user/friend/requests/deny/${friendId}`,
      {},
      {
        withCredentials: true,
      }
    )
    .then(({ data }) => {
      pendingFriends.update((f) => {
        f.delete(friendId);
        return f;
      });
      return data;
    })
    .catch(console.error);

const getFriendList = (): Promise<number[]> =>
  axios
    .get(`${import.meta.env.VITE_BACKEND_URI}/api/user/friends`, {
      withCredentials: true,
    })
    .then(({ data }) => data)
    .catch(console.error);

const getBlockList = (): Promise<number[]> =>
  axios
    .get(`${import.meta.env.VITE_BACKEND_URI}/api/user/blocks`, {
      withCredentials: true,
    })
    .then(({ data }) => data)
    .catch(console.error);

export {
  addFriend,
  delFriend,
  getPendingFriendRequests,
  acceptFriendRequest,
  denyFriendRequest,
  getFriendList,
  getBlockList,
};
