<script lang="ts">
  import { displayname, status } from "../stores/settings.js";
  import { push } from "svelte-spa-router";

  $status = 1;
</script>

<div class="flex flex-col h-full justify-evenly gap-4">
  <h1 class="text-4xl text-center font-bold">Welcome {$displayname} !</h1>
  <div class="flex flex-row justify-evenly">
    <button class="btn btn-lg btn-primary" on:click={() => push("/game")}
      >Game</button
    >
    <button class="btn btn-lg btn-primary" on:click={() => push("/chat")}
      >Chat</button
    >
  </div>
</div>
