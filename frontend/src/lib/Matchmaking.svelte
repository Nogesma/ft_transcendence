<script lang="ts">
  import type { Socket } from "socket.io-client";
  import dayjs, { Dayjs } from "dayjs";
  import { divide, split, startsWith } from "ramda";
  import { replace } from "svelte-spa-router";
  import { onMount } from "svelte";
  import { gameId } from "../stores/settings";

  export let socket: Socket;

  let inQueue = false;
  let timeout: number;
  let start: Dayjs, time: string;

  const removeListenners = (s: Socket) => {
    s.off("inQueue");
    s.off("notQueue");
    s.off("matchFound");
  };

  const registerListenners = (s: Socket) => {
    s.on("inQueue", () => {
      start = dayjs();
      inQueue = true;
      time = "00:00";
      timeout = window.setInterval(
        () => (time = secondsToTime(divide(dayjs().diff(start), 1000))),
        1000
      );
    });

    s.on("notQueue", () => {
      clearInterval(timeout);
      inQueue = false;
      replace(`/game`);
    });

    s.on("matchFound", (id) => {
      clearInterval(timeout);
      removeListenners(s);
      replace(`/game/${id}`);
    });
  };

  const joinQueue = (n: boolean) => socket.emit("joinQueue", n);

  const leaveQueue = () => socket.emit("leaveQueue", null);

  const secondsToTime = (time: number): string => {
    if (time === Infinity || time == -Infinity) {
      return "DNF";
    }

    let min = String(Math.floor(time / 60));
    let s = (time - Number(min) * 60).toFixed(0);
    if (s.length === 1) {
      s = "0" + s;
    }

    if (min.length === 1) {
      min = "0" + min;
    }

    return `${min + ":"}${s}`;
  };

  onMount(() => registerListenners(socket));

  $: if (socket && startsWith("custom", $gameId)) {
    const [, type, opponentId] = split(".", $gameId);

    socket.emit("customGame", {
      id: Number(opponentId),
      type: Boolean(Number(type)),
    });
  }
</script>

<div class="hero">
  <div class="hero-content text-center">
    <div>
      <h1 class="text-5xl font-bold pb-40">Start game !</h1>
      {#if !inQueue}
        <button
          class="btn btn-active btn-primary btn-lg"
          on:click={() => joinQueue(false)}>Classic Pong</button
        >
        <button
          class="btn btn-active btn-primary btn-lg"
          on:click={() => joinQueue(true)}>Modified Pong</button
        >
      {:else}
        <button class="btn btn-active btn-primary btn-lg" on:click={leaveQueue}
          >{time}</button
        >
      {/if}
    </div>
  </div>
</div>
