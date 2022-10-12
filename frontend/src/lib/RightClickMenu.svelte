<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import { id } from "../stores/settings";
  import { addFriend, delFriend } from "../utils/friend.js";
  import {
    blockUser,
    getUserPermissions,
    unblockUser,
  } from "../utils/chatManagement.js";

  export let pos = { x: 0, y: 0 };
  export let uid = 0;
  export let displayname = "";
  export let userLogin = "";
  export let channel = "";

  export let banUser: (userLogin: string) => void;
  export let muteUser: (userLogin: string) => void;

  const dispatch = createEventDispatcher();

  let menu: HTMLElement;
  const onPageClick = (e: MouseEvent) => {
    if (!menu || e.target === menu || menu.contains(e.target as Node)) return;
    dispatch("clickoutside");
  };

  $: () => {
    if (!menu) return;

    const rect = menu.getBoundingClientRect();
    pos.x = Math.min(window.innerWidth - rect.width, pos.x);
    if (pos.y > window.innerHeight - rect.height) pos.y -= rect.height;
  };
</script>

<svelte:body on:click={onPageClick} />

{#if $id !== uid}
  {#await getUserPermissions(uid, channel) then { block, admin, friend }}
    <ul
      transition:fade={{ duration: 100 }}
      bind:this={menu}
      style="top: {pos.y}px; left: {pos.x}px;"
      class="menu p-2 shadow bg-base-100 rounded-box w-52 absolute grid z-40"
    >
      {#if !friend}
        <li>
          <button on:click={() => addFriend(userLogin)}>Add friend</button>
        </li>{:else}
        <li>
          <button on:click={() => delFriend(userLogin)}>Remove friend</button>
        </li>
      {/if}

      {#if !block}
        <li class="text-red-600">
          <button on:click={() => blockUser(uid)}>Block {displayname}</button>
        </li>{:else}
        <li class="text-red-600">
          <button on:click={() => unblockUser(uid)}
            >Unblock {displayname}</button
          >
        </li>
      {/if}

      {#if admin}
        <li class="text-red-600">
          <button on:click={() => banUser(userLogin)}>Ban {displayname}</button>
        </li>
        <li class="text-red-600">
          <button on:click={() => muteUser(userLogin)}
            >Mute {displayname}</button
          >
        </li>
      {/if}
    </ul>
  {/await}
{/if}
