<script lang="ts">
  import ChannelManager from "../lib/ChannelManager.svelte";
  import { params } from "svelte-spa-router";

  $: channel = $params?.channelName ?? "";
</script>

<div class="flex flex-col p-5 gap-2">
  <ChannelManager {channel} p={true} />
</div>
