<script lang="ts">
  import axios from "axios";
  import JoinChannel from "../lib/JoinChannel.svelte";
  import CreateChannel from "../lib/CreateChannel.svelte";
  import DeleteChannel from "../lib/DeleteChannel.svelte";
  import BanUser from "../lib/BanUser.svelte";
  import { push } from "svelte-spa-router";

  const getChannels = () =>
    axios.get(`${import.meta.env.VITE_BACKEND_URI}/api/chat/channels`, {
      withCredentials: true,
    });
</script>

{#await getChannels()}
  <p>waiting...</p>
{:then { data }}
  {#each data as { name }}
    <button class="btn" on:click={() => push(`/chat/${name}`)}>{name} </button>
  {/each}
  <JoinChannel />
  <CreateChannel />
  <DeleteChannel />
  <BanUser />
  <!--    <LeaveChannel />-->
{:catch err}
  <p>{err}</p>
{/await}
