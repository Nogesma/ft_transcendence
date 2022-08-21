<script lang="ts">
  import { displayname } from "../stores/settings.js";
  import { push } from "svelte-spa-router";
</script>

<main class="flex flex-col">
  <h1 class="m-auto text-5xl font-bold">
    {$displayname}
  </h1>
  <button class="btn btn-accent" on:click={() => push("/chat")}>Chat</button>
  <button class="btn btn-secondary" on:click={() => push("/game")}>Game</button>
</main>
