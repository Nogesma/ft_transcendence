<script lang="ts">
  // todo: this module should probably just be a popup within channelmanager

  import axios from "axios";
  import { push } from "svelte-spa-router";

  const getPublicChannels = () =>
    axios.get(`${import.meta.env.VITE_BACKEND_URI}/api/chat/public`, {
      withCredentials: true,
    });
  // .catch(() => push("/auth/login"))

  const joinChannel = (chan: string) =>
    axios
      .post(
        `${import.meta.env.VITE_BACKEND_URI}/api/chat/join`,
        { name: chan },
        {
          withCredentials: true,
        }
      )
      .then(() => push("/"))
      .catch();
</script>

{#await getPublicChannels()}
  <p>waiting...</p>
{:then { data }}
  <ul class="menu bg-base-100 w-56 rounded-box">
    <li>
      <button on:click={() => push("/chat/create")}>Join private channel</button
      >
    </li>
    {#if data.length}
      <li class="menu-title">
        <span>Public Channels</span>
      </li>
    {/if}
    {#each data as channel}
      <li>
        <button on:click={() => joinChannel(channel)}>{channel} </button>
      </li>
    {/each}
  </ul>
{:catch err}
  {err}
{/await}
