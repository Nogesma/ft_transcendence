<script>
  import Icon from "svelte-awesome";
  import {
    faArrowRightFromBracket,
    faX,
  } from "@fortawesome/free-solid-svg-icons";

  import ChannelManager from "./ChannelManager.svelte";

  let showChat = false;
  let channel = "";
</script>

<div class="flex flex-col flex-shrink-0 {showChat ? 'w-96' : ''} rounded">
  <div
    tabindex="0"
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
  </div>

  {#if showChat}
    <ChannelManager bind:channel p={false} />
  {/if}
</div>
