<script>
  import Chat from "./Chat.svelte";

  import Icon from "svelte-awesome";
  import {
    faArrowRightFromBracket,
    faX,
  } from "@fortawesome/free-solid-svg-icons";
  export let channel;

  let showChat = true;
</script>

<div class="border-accent border">
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
    <Chat {channel} />
  {/if}
</div>
