<script lang="ts">
  import { gameSocket } from "../utils/socket";
  import { Socket } from "socket.io-client";
  import { id } from "../stores/settings";
  import dayjs, { Dayjs } from "dayjs";
  import { divide } from "ramda";

  let socket: Socket | null;

  // 0 => before matchmaking, 1 => matchmaking, 2 => in game
  let state = 0;
  let timeout;

  let p1: number, p2: number;

  const registerHandlers = (s) => {
    s.on("inQueue", () => {
      start = dayjs();
      state = 1;
      time = "00:00";
      timeout = setInterval(
        () => (time = secondsToTime(divide(dayjs().diff(start), 1000))),
        1000
      );
    });

    s.on("notQueue", () => {
      state = 0;
      clearTimeout(timeout);
    });

    s.on("matchFound", (p) => {
      state = 2;
      p1 = p.p1;
      p2 = p.p2;
    });
  };

  const initSocket = () => {
    const s = gameSocket();
    registerHandlers(s);

    return s;
  };

  $: if ($id !== 0) socket = initSocket();

  const joinQueue = () => {
    if (socket) socket.emit("joinQueue", null);
  };

  const leaveQueue = () => {
    if (socket) socket.emit("leaveQueue", null);
  };

  let start: Dayjs, time: string;

  const secondsToTime = (time: number): string => {
    if (time === Infinity || time == -Infinity) {
      return "DNF";
    }

    let min = String(Math.floor(time / 60));
    let s = (time - min * 60).toFixed(0);
    if (s.length === 1) {
      s = "0" + s;
    }

    if (min.length === 1) {
      min = "0" + min;
    }

    return `${min + ":"}${s}`;
  };
</script>

{#if state !== 2}
  <div class="hero min-h-screen">
    <div class="hero-content text-center">
      <div>
        <h1 class="text-5xl font-bold pb-40">Start game !</h1>
        {#if state === 0}
          <button class="btn btn-active btn-primary btn-lg" on:click={joinQueue}
            >Ready</button
          >
        {:else}
          <button
            class="btn btn-active btn-primary btn-lg"
            on:click={leaveQueue}>{time}</button
          >
        {/if}
      </div>
    </div>
  </div>
{:else}
  Game;
{/if}
