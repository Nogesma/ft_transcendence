import { derived, writable } from "svelte/store";
import axios from "axios";
import { isEmpty, not } from "ramda";

const isLoggedIn = writable(false);

const displayname = writable("");

const login = writable("");

const id = writable(0);

const gameId = writable("");

const updatepfp = writable(0);

const pfp = derived([login, updatepfp], ([$login, $updatepfp], set) => {
  if (not(isEmpty($login)))
    axios
      .head(`/imgs/${$login}.jpg`)
      .then(() => set(`/imgs/${$login}.jpg?t=${$updatepfp}`))
      .catch(() => set(`https://cdn.intra.42.fr/users/${$login}.jpg`));
});

const status = writable(1);

export { isLoggedIn, displayname, id, login, pfp, updatepfp, status, gameId };
