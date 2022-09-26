import type { Socket } from "socket.io-client";
import { pendingPM, privateMessages } from "../stores/settings";

const initPM = (socket: Socket) => {
  socket.on("newPM", ({ id, message }) => {
    pendingPM.update((n) => n + 1);
    privateMessages.update((pm) => {
      const m = pm.get(id);
      if (m) m.push({ message, me: false });
      else pm.set(id, [{ message, me: false }]);

      return pm;
    });
  });
};

export { initPM };
