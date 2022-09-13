<script lang="ts">
  import { getGameSocket } from "../utils/socket";
  import type { Socket } from "socket.io-client";
  import { id, status, gameId } from "../stores/settings";
  import { getUserInfo, getUserStats } from "../utils/info.js";
  import ProfilePic from "../lib/ProfilePic.svelte";
  import Matchmaking from "../lib/Matchmaking.svelte";
  import { isEmpty, startsWith } from "ramda";
  import { params, replace } from "svelte-spa-router";
  import ChatDrawer from "../lib/ChatDrawer.svelte";

  type Bar = {
    x: number;
    y: number;
    w: number;
    h: number;
  };

  type Ball = {
    x: number;
    y: number;
    w: number;
    h: number;
    dx: number;
    dy: number;
  };

  const initCanvas = (width: number, height: number) => {
    console.log({ width, height });
    canvas = <HTMLCanvasElement>document.getElementById("game");

    if (!canvas) throw new Error("Canvas does not exist.");

    canvas.height = height;
    canvas.width = width;

    ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Context does not exist.");

    staticCanvas();
  };

  const staticCanvas = () => {
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";

    for (let i = 0; i < 15; i++) {
      ctx.fillRect(canvas.width / 2, 20 + 30 * i, 5, 15);
    }

    ctx.font = "50px sans-serif";
    ctx.fillText(String(score[0]), canvas.width / 4, 50);
    ctx.fillText(String(score[1]), (3 * canvas.width) / 4, 50);
  };

  const updateCanvas = ({ ball, bars }: { ball: Ball; bars: [Bar, Bar] }) => {
    if (!ctx || !canvas) return;

    staticCanvas();
    ctx.fillRect(bars[0].x, bars[0].y, bars[0].w, bars[0].h);
    ctx.fillRect(bars[1].x, bars[1].y, bars[1].w, bars[1].h);
    ctx.fillRect(ball.x, ball.y, ball.w, ball.h);
  };

  const registerListenners = (s: Socket) => {
    s.on(
      "gameInfo",
      ({
        width,
        height,
        p1,
        p2,
        spectators,
      }: {
        width: number;
        height: number;
        p1: number;
        p2: number;
        spectators: Set<number>;
      }) => {
        if (!width) replace("/game");

        const checkExist = setInterval(() => {
          if (<HTMLCanvasElement>document.getElementById("game")) {
            clearInterval(checkExist);
            initCanvas(width, height);
          }
        }, 100);

        player1 = p1;
        player2 = p2;
        spectatorList = new Set(spectators);

        isSpectating = $id !== p1 && $id !== p2;

        if (isSpectating) $status = 3;
        else $status = 2;

        // for now fps is tied to server tick rate, and no movement prediction is happening, we only update the display
        // when receiving new information from the server.
        s.on("gameState", updateCanvas);
        s.on("updateScore", (s: [number, number]) => (score = s));

        s.on("newSpectator", (id) => {
          spectatorList.add(id);
          spectatorList = spectatorList;
        });
        s.on("delSpectator", (id) => {
          spectatorList.delete(id);
          spectatorList = spectatorList;
        });
      }
    );
  };

  let isSpectating = true;
  let spectatorList = new Set<number>();

  let canvas: HTMLCanvasElement | null;
  let ctx: CanvasRenderingContext2D | null;
  let player1: number, player2: number;
  let score = [0, 0];

  const socket = getGameSocket();

  $: $gameId = $params?.id ?? "";

  $: if (!isEmpty($gameId) && !startsWith("custom", $gameId)) {
    registerListenners(socket);

    socket.emit("joinGame", $gameId);
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (isSpectating) return;

    if (event.key === "ArrowUp") {
      event.preventDefault();
      socket.volatile.emit("move", { dir: -1, game: $gameId });
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      socket.volatile.emit("move", { dir: 1, game: $gameId });
    }
  };

  const handleKeyup = (event: KeyboardEvent) => {
    if (isSpectating) return;

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      socket.volatile.emit("move", { dir: 0, game: $gameId });
    }
  };
</script>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />

<div class="flex flex-row h-full">
  <ChatDrawer />

  {#if isEmpty($gameId) || startsWith("custom", $gameId)}
    <Matchmaking {socket} />
  {:else}
    <div class="flex flex-auto flex-col">
      <div class="flex flex-row flex-auto justify-evenly flex-nowrap">
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
      <div class="flex justify-center">
        Spectators :
        {#each [...spectatorList] as spec}
          {#await getUserInfo(spec) then { login, displayname: name }}
            <ProfilePic user={login} attributes="h-10 w-10 rounded-full" />
            {name}
          {/await}
        {/each}
      </div>
    </div>
  {/if}
</div>
