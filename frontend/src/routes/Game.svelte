<script lang="ts">
  import { gameSocket } from "../utils/socket";
  import type { Socket } from "socket.io-client";
  import { id } from "../stores/settings";
  import { getUserInfo, getUserStats } from "../utils/info.js";
  import ProfilePic from "../lib/ProfilePic.svelte";
  import Matchmaking from "../lib/Pong/Matchmaking.svelte";
  import { isNil } from "ramda";
  import { params } from "svelte-spa-router";

  const initCanvas = (width: number, height: number) => {
    const cv = <HTMLCanvasElement>document.getElementById("game");

    if (!cv) throw new Error("Canvas does not exist.");

    cv.height = height;
    cv.width = width;

    ctx = cv.getContext("2d");

    if (!ctx) throw new Error("Context does not exist.");

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
  };

  const registerListenners = (s: Socket) => {
    s.on(
      "gameInfo",
      // i fucking love typescript
      ({
        width,
        height,
        p1,
        p2,
      }: {
        width: number;
        height: number;
        p1: number;
        p2: number;
      }) => {
        if (!width) return alert(`No game with id: ${gameId} found.`);

        console.log("received game info");
        initCanvas(width, height);

        player1 = p1;
        player2 = p2;

        isSpectating = $id === p1 || $id === p2;

        console.log(player1, player2);
        // only register frame handler after canvas is init
        // todo: frame handler
        // s.on("frame", (data) => {
        // drawFrame(data);
        // window.requestAnimationFrame(() => {
        // we dont need a callback for now;
        // });
        // });
      }
    );
  };

  // todo:
  // we need to decide how we send events
  // either send one event on each keydown and allow repeated events
  // or send a event on keydown and one on keyup, <== this one is probably better but a bit harder to implement
  const handleKeydown = (event: KeyboardEvent) => {
    if (isSpectating || event.repeat) return;
    if (event.key === "up") {
      //todo: send event;
    }
    if (event.key === "down") {
      // todo: send event;
    }
  };

  const handleKeyup = (event: KeyboardEvent) => {
    if (isSpectating || event.repeat) return;
    if (event.key === "up") {
      //todo: send event;
    }
    if (event.key === "down") {
      // todo: send event;
    }
  };

  let socket: Socket | undefined;
  let isSpectating = true;

  let ctx: CanvasRenderingContext2D | null;
  let player1: number, player2: number;

  $: if ($id !== 0) {
    socket = gameSocket();
    console.log(socket);
  }

  $: gameId = $params?.id;

  $: if (gameId && socket) {
    console.log("registering", gameId, socket);
    registerListenners(socket);
    socket.emit("joinGame", gameId);
  }
</script>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />

{#if isNil(gameId)}
  {#if socket}
    <Matchmaking {socket} />
  {/if}
{:else}
  <div class="flex flex-auto justify-around flex-nowrap">
    {#if player1}
      <div class="flex-col">
        {#await getUserInfo(player1) then { login, displayname: name }}
          <ProfilePic user={login} attributes="h-10 w-10 rounded-full" />
          {name}
          {#await getUserStats(player1) then { elo }}
            {elo}
          {/await}
        {/await}
      </div>
    {/if}

    <canvas id="game" />

    {#if player2}
      <div class="flex-col">
        {#await getUserInfo(player2) then { login, displayname: name }}
          <ProfilePic user={login} attributes="h-10 w-10 rounded-full" />
          {name}
          {#await getUserStats(player2) then { elo }}
            {elo}
          {/await}
        {/await}
      </div>
    {/if}
  </div>
{/if}
