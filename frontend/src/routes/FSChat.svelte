<script lang="ts">
  import ChannelManager from "../lib/ChannelManager.svelte";
  import { params } from "svelte-spa-router";

  $: channel = $params?.id ?? "";
</script>

<ChannelManager {channel} p={true} />
