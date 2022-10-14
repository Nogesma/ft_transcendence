import { derived, readable, type Writable, writable } from "svelte/store";
import axios from "axios";
import { isEmpty, not } from "ramda";
import { getChatSocket, getPmSocket } from "../utils/socket";
import {
  getBlocks,
  getFriendList,
  getPendingFriendRequests,
} from "../utils/friend";

const isLoggedIn = writable(false);

const displayname = writable("");

const login = writable("");

const id = writable(0);

const gameId = writable("");

const updatepfp = writable(0);

const pendingFriends = writable(
  new Set<number>(await getPendingFriendRequests())
);

const pfp = derived([login, updatepfp], ([$login, $updatepfp], set) => {
  if (not(isEmpty($login)))
    axios
      .head(`/imgs/${$login}.jpg`)
      .then(() => set(`/imgs/${$login}.jpg?t=${$updatepfp}`))
      .catch(() => set(`https://cdn.intra.42.fr/users/${$login}.jpg`));
});

const status = writable(1);

const pmSocket = readable(getPmSocket());

const privateMessages = writable(
  new Map<number, { message: string; me: boolean }[]>()
);

const pendingPM = writable(0);

const chatSocket = readable(getChatSocket());

const friends: Writable<Set<number>> = writable(
  new Set<number>(await getFriendList())
);

const blocks: Writable<Set<number>> = writable(
  new Set<number>(await getBlocks())
);

export {
  isLoggedIn,
  displayname,
  id,
  login,
  pfp,
  updatepfp,
  status,
  gameId,
  pendingFriends,
  pmSocket,
  chatSocket,
  pendingPM,
  privateMessages,
  friends,
  blocks,
};
