<script lang="ts">
  import ChannelManager from "../lib/ChannelManager.svelte";
  import { params } from "svelte-spa-router";

  $: channel = $params?.channelName ?? "";
</script>

<ChannelManager {channel} p={true} />
