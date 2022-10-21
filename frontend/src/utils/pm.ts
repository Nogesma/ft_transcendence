import type { Socket } from "socket.io-client";
import {
  blocks,
  friends,
  id,
  invite,
  pendingFriends,
  pendingPM,
  privateMessages,
} from "../stores/settings";
import type { Message } from "../chat";
import { push } from "svelte-spa-router";
import { get } from "svelte/store";

const initPM = (socket: Socket) => {
  friends.subscribe((f) => {
    privateMessages.update((pm) => {
      f.forEach((i) => {
        if (!pm.has(i)) pm.set(i, []);
      });
      return pm;
    });
  });

  socket.on("newPM", (e: Message) => {
    pendingPM.update((n) => n + 1);
    privateMessages.update((pm) => {
      const m = pm.get(e.id);
      if (m) m.push(e);
      else pm.set(e.id, [e]);

      return pm;
    });
  });

  socket.on("newPendingFriendRequest", (id) => {
    pendingFriends.update((p) => {
      p.add(id);
      return p;
    });
  });

  socket.on("newFriend", (id) => {
    friends.update((f) => {
      f.add(id);
      return f;
    });
  });

  socket.on("delFriend", (id) => {
    friends.update((f) => {
      f.delete(id);
      return f;
    });
  });

  socket.on("newInvite", (event) => {
    pendingPM.update((n) => n + 1);
    invite.update((i) => {
      i.set(event.id, event);
      return i;
    });
  });

  socket.on("newCustomGame", ({ p1, p2, type }) => {
    invite.update((i) => {
      i.delete(p1);
      i.delete(p2);
      return i;
    });
    if (get(id) === p1) push(`#/game/custom.${type}.${p2}`);
    if (get(id) === p2) push(`#/game/custom.${type}.${p1}`);
  });
};

export { initPM };
