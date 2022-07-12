<script lang="ts">
  import Pong from "./Pong.svelte";
  import axios from "axios";

  let gid: number;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  function handleKeydown() {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  function handleKeyup() {}

  const setupGame = async () =>
    axios
      .get(`${import.meta.env.VITE_BACKEND_URI}/api/pong/game/new`, {
        withCredentials: true,
      })
      .then(({ data }) => {
        gid = data.game_id;
        return data.params;
      });
</script>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />

<div>
  {#await setupGame()}
    <h1>Loading...</h1>
  {:then data}
    Game id: {gid}
    <Pong width={1000} height={500} params={data} />
  {:catch err}
    {err}
  {/await}
</div>
