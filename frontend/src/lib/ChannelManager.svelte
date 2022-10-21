<script lang="ts">
  import JoinChannel from "./JoinChannel.svelte";
  import CreateChannel from "./CreateChannel.svelte";
  import { isEmpty } from "ramda";
  import Chat from "./Chat.svelte";
  import { push } from "svelte-spa-router";
  import { getChannels } from "../utils/chatManagement.js";
  import LeaveChannel from "./LeaveChannel.svelte";
  import type { MessageList } from "../chat";

  export let channel = "";
  export let p = false;

  export let messagesList: MessageList = [];

  let channelList: Promise<{ name: string }[]> | undefined;

  const refreshChannels = () =>
    (channelList = getChannels() as Promise<{ name: string }[]>);

  $: if (isEmpty(channel)) refreshChannels();
</script>

{#if isEmpty(channel)}
  {#if channelList}
    <div class="flex flex-col p-2 gap-2 overflow-y-auto">
      {#await channelList then data}
        {#each data as { name }}
          <button
            class="btn btn-primary m-2"
            on:click={() => (p ? push(`/chat/${name}`) : (channel = name))}
            >{name}
          </button>
        {/each}
        <JoinChannel on:newChannel={refreshChannels} />
        <CreateChannel on:newChannel={refreshChannels} />
        <LeaveChannel channels={data} on:newChannel={refreshChannels} />
      {:catch err}
        <p>{err}</p>
      {/await}
    </div>
  {/if}
{:else}
  <Chat bind:channel bind:messagesList {p} />
{/if}
