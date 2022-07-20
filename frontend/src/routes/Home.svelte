<script lang="ts">
  import ChannelManager from "../lib/ChannelManager.svelte";
  import { displayname } from "../stores/settings.js";

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
</script>

<main class="flex flex-col">
  <h1 class="m-auto text-5xl font-bold">
    {$displayname}
  </h1>
  <ChannelManager />
</main>
