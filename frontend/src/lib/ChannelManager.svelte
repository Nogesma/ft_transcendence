<script lang="ts">
  import axios from "axios";
  import JoinChannel from "./JoinChannel.svelte";
  import CreateChannel from "./CreateChannel.svelte";
  import DeleteChannel from "./DeleteChannel.svelte";
  import BanUser from "./BanUser.svelte";
  import { isEmpty } from "ramda";
  import Chat from "./Chat.svelte";
  import { push } from "svelte-spa-router";

  export let channel = "";
  export let p = false;

  const getChannels = () =>
    axios.get(`${import.meta.env.VITE_BACKEND_URI}/api/chat/channels`, {
      withCredentials: true,
    });
</script>

{#if isEmpty(channel)}
  <div class="flex flex-col">
    {#await getChannels() then { data }}
      {#each data as { name }}
        <button
          class="btn"
          on:click={() => (p ? push(`/chat/${name}`) : (channel = name))}
          >{name}
        </button>
      {/each}
      <JoinChannel />
      <CreateChannel />
      <DeleteChannel />
      <BanUser />
      <!--    <LeaveChannel />-->
    {:catch err}
      <p>{err}</p>
    {/await}
  </div>
{:else}
  <Chat bind:channel {p} />
{/if}
