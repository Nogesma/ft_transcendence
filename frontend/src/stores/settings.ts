import { derived, readable, type Writable, writable } from "svelte/store";
import axios from "axios";
import { isEmpty, not } from "ramda";
import { getChatSocket, getPmSocket } from "../utils/socket";
import type { MessageList } from "../chat";

const isLoggedIn = writable(false);

const displayname = writable("");

const login = writable("");

const id = writable(0);

const gameId = writable("");

const defaultpfp = writable("");

const updatepfp = writable(0);

const pendingFriends = writable(new Set<number>());

const pfp = derived(
  [login, updatepfp, defaultpfp],
  ([$login, $updatepfp, $defaultpfp], set) => {
    if (not(isEmpty($login)))
      axios
        .head(`/imgs/${$login}.jpg`)
        .then(() => set(`/imgs/${$login}.jpg?t=${$updatepfp}`))
        .catch(() => set($defaultpfp));
  }
);

const status = writable(1);

const pmSocket = readable(getPmSocket());

const invite = writable(
  new Map<number, { id: number; displayname: string; type: boolean }>()
);

const privateMessages = writable(new Map<number, MessageList>());

const pendingPM = writable(0);

const chatSocket = readable(getChatSocket());

const friends: Writable<Set<number>> = writable(new Set<number>());

const blocks: Writable<Set<number>> = writable(new Set<number>());

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
  invite,
  defaultpfp,
};
