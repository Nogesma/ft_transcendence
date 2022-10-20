<script lang="ts">
  import Icon from "svelte-awesome";
  import {
    faArrowRightFromBracket,
    faX,
  } from "@fortawesome/free-solid-svg-icons";

  import ChannelManager from "./ChannelManager.svelte";
  import { onDestroy } from "svelte";
  import { chatSocket } from "../stores/settings";

  let showChat = false;
  let channel = "";

  let messagesList: Array<{
    message: string;
    login: string;
    displayname: string;
    id: number;
  }> = [];

  onDestroy(() => $chatSocket.emit("leaveRooms"));
</script>

<div class="flex w-max flex-col flex-shrink-0 {showChat ? 'w-96 bg-secondary' : ''} rounded">
  <button
    class="btn btn-ghost btn-circle"
    on:click={() => (showChat = !showChat)}
  >
    <div class="indicator">
      {#if showChat}
        <Icon data={faX} />
      {:else}
        <Icon data={faArrowRightFromBracket} />
      {/if}
    </div>
  </button>

  {#if showChat}
    <ChannelManager bind:channel bind:messagesList p={false} />
  {/if}
</div>
