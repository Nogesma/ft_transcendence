import type { Socket } from "socket.io-client";
import {
  friends,
  pendingFriends,
  pendingPM,
  privateMessages,
} from "../stores/settings";
import type { Message } from "../chat";

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
};

export { initPM };
