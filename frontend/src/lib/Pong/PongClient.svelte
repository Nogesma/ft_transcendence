<script lang="ts">
  import Pong from "./Pong.svelte";
  import axios from "axios";
  import { onMount } from "svelte";

  let gid;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  function handleKeydown() {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  function handleKeyup() {}

  let game = async () => {
    return axios
      .get(`${import.meta.env.VITE_BACKEND_URI}/api/pong/game/new`)
      .then(({ data }) => {
        return data;
      });
  };

  const getGameData = async (game_id: string) => {
    return axios
      .get(`${import.meta.env.VITE_BACKEND_URI}/api/pong/game/${game_id}`)
      .then((res) => {
        return res.data;
      });
  };

  onMount(() => (gid = game()));
</script>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />

<div>
  {#await getGameData(gid)}
    <h1>Loading...</h1>
  {:then data}
    <Pong width={500} height={250} params={data} />
  {:catch err}
    err
  {/await}
</div>
