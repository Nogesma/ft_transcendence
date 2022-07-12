<script lang="ts">
  import ChannelManager from "../lib/ChannelManager.svelte";
  import axios from "axios";
  import { push } from "svelte-spa-router";
  import { onMount } from "svelte";
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
  import { login } from "../stores/settings";
  import { isNil, when } from "ramda";

  const userDataUrl = `${import.meta.env.VITE_BACKEND_URI}/api/user/me`;

  const isLoggedIn = async () =>
    axios
      .head(userDataUrl, { withCredentials: true })
      .then(() => {
        $login = true;
        when(isNil, getUserData)(localStorage.login);
      })
      .catch(() => {
        $login = false;
        push("/auth/login");
      });

  const getUserData = async () =>
    axios
      .get(userDataUrl, {
        withCredentials: true,
      })
      .then(({ data }) => {
        localStorage.displayname = data.displayname;
        localStorage.login = data.login;
        localStorage.id = data.id;
        $login = true;
      })
      .catch(() => {
        $login = false;
        push("/auth/login");
      });

  if (new URLSearchParams(window.location.search).has("code"))
    push("/auth/oauth2callback" + window.location.search);
  else onMount(isLoggedIn);
</script>

<main class="flex flex-col">
  <h1 class="m-auto text-5xl font-bold">
    {localStorage.displayname}
  </h1>
  <ChannelManager />
  <div class="flex flex-auto justify-center content-center">
    <PongClient />
  </div>
</main>
