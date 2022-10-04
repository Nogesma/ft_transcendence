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

const delFriend = (friendName: string) =>
  axios
    .post(
      `${import.meta.env.VITE_BACKEND_URI}/api/user/friend/del/${friendName}`,
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
    .then(({ data }) => data)
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
    .then(({ data }) => data)
    .catch(console.error);

const getFriendList = () =>
  axios
    .get(`${import.meta.env.VITE_BACKEND_URI}/api/user/friends`, {
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
};
