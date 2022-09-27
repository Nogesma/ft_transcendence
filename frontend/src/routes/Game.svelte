<script lang="ts">
  import type { Ball, Bar, Player } from "../game";
  import { getGameSocket } from "../utils/socket";
  import type { Socket } from "socket.io-client";
  import { id, status, gameId } from "../stores/settings";
  import { getUserInfo, getUserStats } from "../utils/info.js";
  import ProfilePic from "../lib/ProfilePic.svelte";
  import Matchmaking from "../lib/Matchmaking.svelte";
  import { isEmpty, startsWith } from "ramda";
  import { params, replace } from "svelte-spa-router";
  import ChatDrawer from "../lib/ChatDrawer.svelte";
  // import { calculateState } from "../utils/game";
  import UserCard from "../lib/UserCard.svelte";

  let ball: Ball, p1: Player, p2: Player;

  let WIDTH = 0,
    HEIGHT = 0;

  const initCanvas = (width: number, height: number) => {
    const canvas = <HTMLCanvasElement>document.getElementById("game");

    if (!canvas) throw new Error("Canvas does not exist.");

    WIDTH = width;
    HEIGHT = height;

    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("Context does not exist.");

    staticCanvas();
  };

  const staticCanvas = () => {
    if (!ctx) return;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#fff";

    for (let i = 0; i < 15; i++) {
      ctx.fillRect(WIDTH / 2, 20 + 30 * i, 5, 15);
    }

    if (!p1 || !p2) return;

    ctx.font = "50px sans-serif";
    ctx.fillText(String(p1.score), WIDTH / 4, 50);
    ctx.fillText(String(p2.score), (3 * WIDTH) / 4, 50);
  };

  const updateData = ({ ball: b, bars }: { ball: Ball; bars: [Bar, Bar] }) => {
    ball = b;
    let d = p1.bar.direction;

    p1.bar = bars[0];
    p1.bar.direction = d;

    d = p2.bar.direction;
    p2.bar = bars[1];
    p2.bar.direction = d;
  };

  const updateState = (dt: number) => {
    if (!p1 || !p2 || !ball) return;
    // disable client-side prediction for now.
    dt;
    // calculateState(p1, p2, ball, dt, HEIGHT);
    updateCanvas();
  };

  const updateCanvas = () => {
    if (!ctx) return;

    staticCanvas();
    if (!p1 || !p2) return;
    ctx.fillRect(p1.bar.x, p1.bar.y, p1.bar.w, p1.bar.h);
    ctx.fillRect(p2.bar.x, p2.bar.y, p2.bar.w, p2.bar.h);
    ctx.fillRect(ball.x, ball.y, ball.w, ball.h);
  };

  const registerListenners = (s: Socket) => {
    s.on(
      "gameInfo",
      ({
        width,
        height,
        player1,
        player2,
        spectators,
      }: {
        width: number;
        height: number;
        player1: Player;
        player2: Player;
        spectators: Set<number>;
      }) => {
        if (!width) replace("/game");

        const checkExist = setInterval(() => {
          if (<HTMLCanvasElement>document.getElementById("game")) {
            clearInterval(checkExist);
            initCanvas(width, height);
          }
        }, 100);

        p1 = player1;
        p2 = player2;
        id1 = p1.id;
        id2 = p2.id;
        spectatorList = new Set(spectators);

        if ($id === p1.id) player = p1;
        else if ($id === p2.id) player = p2;

        if (!player) $status = 3;
        else $status = 2;

        s.on("gameState", updateData);

        let prev = 0;
        function first(timestamp: number) {
          prev = timestamp;
          window.requestAnimationFrame(frame);
        }
        function frame(timestamp: number) {
          const dt = (timestamp - prev) * 0.001;
          prev = timestamp;
          updateState(dt);
          window.requestAnimationFrame(frame);
        }
        window.requestAnimationFrame(first);

        s.on("updateScore", (s: [number, number]) => {
          p1.score = s[0];
          p2.score = s[1];
        });

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

  let spectatorList = new Set<number>();

  let ctx: CanvasRenderingContext2D | null;

  const socket = getGameSocket();

  $: $gameId = $params?.id ?? "";

  $: if (!isEmpty($gameId) && !startsWith("custom", $gameId)) {
    registerListenners(socket);

    socket.emit("joinGame", $gameId);
  }

  let player: Player | null = null;
  // we need to store the id separately otherwise svelte will refresh every time we update the player state
  let id1: number, id2: number;

  const handleKeydown = (event: KeyboardEvent) => {
    if (!player) return;

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (player.bar.direction !== -1)
        socket.volatile.emit("move", { dir: -1, game: $gameId });
      player.bar.direction = -1;
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (player.bar.direction !== 1)
        socket.volatile.emit("move", { dir: 1, game: $gameId });
      player.bar.direction = 1;
    }
  };

  const handleKeyup = (event: KeyboardEvent) => {
    if (!player) return;

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      if (player.bar.direction !== 0)
        socket.volatile.emit("move", { dir: 0, game: $gameId });
      player.bar.direction = 0;
    }
  };
</script>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />

<div class="flex flex-row h-full w-full">
  <ChatDrawer />

  {#if isEmpty($gameId) || startsWith("custom", $gameId)}
    <Matchmaking {socket} />
  {:else}
    <div class="flex flex-auto flex-col" style="height: {HEIGHT}px">
      <div class="flex flex-row flex-auto justify-evenly flex-nowrap">
        {#if id1}
          <div class="flex-col">
            {#await getUserInfo(id1) then { login, displayname: name }}
              <div class="dropdown">
                <div tabindex="0">
                  <ProfilePic
                    user={login}
                    attributes="h-10 w-10 rounded-full"
                  />
                  {name}
                  {#await getUserStats(id1) then { elo }}
                    {elo}
                  {/await}
                </div>
                <div tabindex="0" class="dropdown-content menu w-80">
                  <UserCard id={id1} />
                </div>
              </div>
            {/await}
          </div>
        {/if}

        <canvas id="game" />

        {#if id2}
          <div class="flex-col">
            {#await getUserInfo(id2) then { login, displayname: name }}
              <div class="dropdown dropdown-end">
                <div tabindex="0">
                  <ProfilePic
                    user={login}
                    attributes="h-10 w-10 rounded-full"
                  />
                  {name}
                  {#await getUserStats(id2) then { elo }}
                    {elo}
                  {/await}
                </div>
                <div tabindex="0" class="dropdown-content menu w-80">
                  <UserCard id={id2} />
                </div>
              </div>
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
