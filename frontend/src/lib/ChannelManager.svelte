<script lang="ts">
  import axios from "axios";
  import JoinChannel from "./JoinChannel.svelte";
  import CreateChannel from "./CreateChannel.svelte";
  import { isEmpty } from "ramda";
  import Chat from "./Chat.svelte";
  import { push } from "svelte-spa-router";

  export let channel = "";
  export let p = false;

  //todo: move to utils/
  const getChannels = () =>
    axios
      .get(`${import.meta.env.VITE_BACKEND_URI}/api/chat/channels`, {
        withCredentials: true,
      })
      .catch((e) => {
        console.error(e);
        return { data: [] };
      });
</script>

{#if isEmpty(channel)}
  {#await getChannels() then { data }}
    {#each data as { name }}
      <button
        class="btn m-2"
        on:click={() => (p ? push(`/chat/${name}`) : (channel = name))}
        >{name}
      </button>
    {/each}
    <JoinChannel />
    <CreateChannel />
  {:catch err}
    <p>{err}</p>
  {/await}
{:else}
  <Chat bind:channel {p} />
{/if}
