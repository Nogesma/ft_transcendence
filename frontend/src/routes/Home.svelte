<script lang="ts">
  import ChannelManager from "../lib/ChannelManager.svelte";
  import { displayname } from "../stores/settings.js";
</script>

<main class="flex flex-col">
  <h1 class="m-auto text-5xl font-bold">
    {$displayname}
  </h1>
  <ChannelManager />
</main>
