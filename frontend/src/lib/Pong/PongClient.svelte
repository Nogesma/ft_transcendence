<script lang="ts">
  import Pong from "./Pong.svelte";
  import axios from "axios";
  import { onMount } from "svelte";

  let gid;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  function handleKeydown() {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  function handleKeyup() {}

  const setupGame = async () => {
    return axios
      .get(`${import.meta.env.VITE_BACKEND_URI}/api/pong/game/new`)
      .then(({ data }) => {
        gid = data.game_id;
        return data.params;
      });
  };

  let game;

  onMount(() => (game = setupGame()));
</script>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />

<div>
  {#await game}
    <h1>Loading...</h1>
  {:then data}
    <Pong width={1000} height={500} params={data} />
  {:catch err}
    {err}
  {/await}
</div>
