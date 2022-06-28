<script lang="ts">
  import Chat from "./Chat.svelte";
  import axios from "axios";
  import { push } from "svelte-spa-router";

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
    <ul class="menu bg-base-100 w-56 rounded-box">
      {#if data.length}
        <li class="menu-title">
          <span>Channels</span>
        </li>
      {/if}
      {#each data as { name, id }}
        <li>
          <button
            on:click={() => {
              channel = { name, id };
              hasChat = true;
            }}
            >{id}:{name}
          </button>
        </li>
      {/each}
      <li class="menu-title">
        <span>Manage Channels</span>
      </li>
      <li>
        <button on:click={() => push("/chat/join")}>Join new channel</button>
      </li>
      <li>
        <button on:click={() => push("/chat/create")}>Create new channel</button
        >
      </li>
      <li>
        <button on:click={() => push("/chat/leave")}>Leave channel</button>
      </li>
    </ul>
  {:catch err}
    <p>{err}</p>
  {/await}
{:else}
  <Chat {channel} />
{/if}
