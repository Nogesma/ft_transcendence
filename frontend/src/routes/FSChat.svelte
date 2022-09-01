<script lang="ts">
  import Chat from "../lib/Chat.svelte";
  import { params } from "svelte-spa-router";

  $: channel = $params?.id ?? "";
</script>

<Chat {channel} />
