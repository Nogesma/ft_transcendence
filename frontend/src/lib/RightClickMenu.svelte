<script lang="ts" xmlns="http://www.w3.org/1999/html">
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import { id } from "../stores/settings";
  import { addFriend, delFriend } from "../utils/friend.js";
  import {
    blockUser,
    hasAdminRights,
    unblockUser,
  } from "../utils/chatManagement.js";
  import { blocks, friends } from "../stores/settings.js";
  import Modal from "./Modal.svelte";
  import { times } from "svelte-awesome/icons";

  export let pos = { x: 0, y: 0 };
  export let uid = 0;
  export let displayname = "";
  export let userLogin = "";
  export let channel = "";

  export let banUser: (userLogin: string, time?: Date) => void;
  export let muteUser: (userLogin: string, time?: Date) => void;

  const dispatch = createEventDispatcher();

  let menu: HTMLElement;
  let time: Date | undefined;

  const onPageClick = (e: MouseEvent) => {
    if (!menu || e.target === menu || menu.contains(e.target as Node)) return;
    // dispatch("clickoutside");
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
  <ul
    transition:fade={{ duration: 100 }}
    bind:this={menu}
    style="top: {pos.y}px; left: {pos.x}px;"
    class="menu p-2 shadow bg-base-100 rounded-box w-52 absolute grid z-40"
  >
    {#if $friends.has(uid)}
      <li>
        <button on:click={() => delFriend(uid)}>Remove friend</button>
      </li>
    {:else}
      <li>
        <button on:click={() => addFriend(userLogin)}>Add friend</button>
      </li>
    {/if}

    {#if $blocks.has(uid)}
      <li class="text-red-600">
        <button on:click={() => unblockUser(uid)}>Unblock {displayname}</button>
      </li>
    {:else}
      <li class="text-red-600">
        <button on:click={() => blockUser(uid)}>Block {displayname}</button>
      </li>
    {/if}

    {#await hasAdminRights(uid, channel) then admin}
      {#if admin}
        <li class="text-red-600">
          <label for="ban-modal" class="modal-button">Ban {displayname}</label>
          <!--          <button on:click={() => banUser(userLogin)}>Ban {displayname}</button>-->
        </li>
        <li class="text-red-600">
          <label for="mute-modal" class="modal-button">Mute {displayname}</label
          >
        </li>
      {/if}
    {/await}
  </ul>
{/if}
<Modal id="ban-modal">
  <svelte:fragment slot="content">
    <div class="flex flex-col">
      <h3 class="text-lg font-bold pb-4">End of Ban</h3>
      <input
        bind:value={time}
        type="datetime-local"
        class="select select-bordered"
      />
      <button
        on:click={() => {
          banUser(userLogin, time);
          time = undefined;
        }}>Confirm {displayname}</button
      >
    </div>
  </svelte:fragment>
</Modal>
<Modal id="mute-modal">
  <svelte:fragment slot="content">
    <div class="flex flex-col">
      <h3 class="text-lg font-bold pb-4">End of Mute</h3>
      <input
        bind:value={time}
        type="datetime-local"
        class="select select-bordered"
      />
      <button
        on:click={() => {
          muteUser(userLogin, time);
          time = undefined;
        }}>Confirm {displayname}</button
      >
    </div>
  </svelte:fragment>
</Modal>
