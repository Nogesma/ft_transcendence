<script lang="ts">
  import axios from "axios";
  import JoinChannel from "./JoinChannel.svelte";
  import CreateChannel from "./CreateChannel.svelte";
  import DeleteChannel from "./DeleteChannel.svelte";
  import { isEmpty } from "ramda";
  export let channel = "";
  let hasChat = false;
  if (!isEmpty(channel)) hasChat = true;
  const getChannels = () =>
    axios.get(`${import.meta.env.VITE_BACKEND_URI}/api/chat/channels`, {
      withCredentials: true,
    });
</script>

{#if !hasChat}
  {#await getChannels()}
    <p>waiting...</p>
  {:then { data }}
    {#each data as { name }}
      <button
        class="btn"
        on:click={() => {
          channel = name;
          hasChat = true;
        }}
        >{name}
      </button>
    {/each}
    <JoinChannel />
    <CreateChannel />
    <DeleteChannel />
    <!--    <LeaveChannel />-->
  {:catch err}
    <p>{err}</p>
  {/await}
{/if}
