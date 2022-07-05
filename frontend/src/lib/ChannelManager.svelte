<script lang="ts">
  import Chat from "./Chat.svelte";
  import axios from "axios";
  import { push } from "svelte-spa-router";
  import JoinChannel from "./JoinChannel.svelte";
  import CreateChannel from "./CreateChannel.svelte";
  import DeleteChannel from "./DeleteChannel.svelte";

  export let channel = { name: "", id: -1 };

  let hasChat = false;

  if (channel.id != -1) hasChat = true;

  const getChannels = () =>
    axios.get(`${import.meta.env.VITE_BACKEND_URI}/api/chat/channels`, {
      withCredentials: true,
    });
</script>

{#if !hasChat}
  {#await getChannels()}
    <p>waiting...</p>
  {:then { data }}
    {#each data as { name, id }}
      <button
        class="btn"
        on:click={() => {
          channel = { name, id };
          hasChat = true;
        }}
        >{id}:{name}
      </button>
    {/each}
    <JoinChannel />
    <CreateChannel />
    <DeleteChannel  />
    <!--    <LeaveChannel />-->
  {:catch err}
    <p>{err}</p>
  {/await}
{:else}
  <Chat {channel} />
{/if}
