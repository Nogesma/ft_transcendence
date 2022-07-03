<script lang="ts">
  import { push } from "svelte-spa-router";
  import { onMount } from "svelte";
  import axios from "axios";
  import ChannelManager from "../lib/ChannelManager.svelte";
  import PongClient from "../lib/Pong/PongClient.svelte";

  // let games = [];
  // let createGame = async () => {
  //   axios
  //     .get(`${import.meta.env.VITE_BACKEND_URI}/api/pong/game/new`)
  //     .then((res) => {
  //       games.push(res.data);
  //       games = games;
  //     });
  // };
  //
  // const getGameData = (game_id: string) => {
  //   return axios
  //     .get(`${import.meta.env.VITE_BACKEND_URI}/api/pong/game/${game_id}`)
  //     .then((res) => {
  //       return res.data;
  //     });
  // };
  //
  // const loop = () => {
  //   setTimeout(loop, 1000);
  //   console.log(games);
  // };

  const getUserData = async () =>
    axios
      .get(`${import.meta.env.VITE_BACKEND_URI}/api/user/me`, {
        withCredentials: true,
      })
      .then(({ data }) => {
        localStorage.displayname = data.displayname;
        localStorage.login = data.login;
      })
      .catch(() => push("/auth/login"));

  if (new URLSearchParams(window.location.search).has("code"))
    push("/auth/oauth2callback" + window.location.search);
  else onMount(getUserData);
</script>

<!--<main class="flex flex-col">-->
<!--  <h1 class="m-auto text-5xl font-bold">-->
<!--    {localStorage.getItem("displayname")}-->
<!--  </h1>-->
<!--  <button on:click={() => push("/chat")}>Chat</button>-->
<!--  <ChannelManager />-->
<!--</main>-->
<div class="flex flex-auto justify-center content-center">
  <PongClient />
</div>
