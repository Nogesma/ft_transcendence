<script lang="ts" xmlns="http://www.w3.org/1999/html">
  import { createEventDispatcher } from "svelte";
  import { id } from "../stores/settings";
  import { addFriend, delFriend } from "../utils/friend.js";
  import {
    blockUser,
    hasAdminRights,
    unblockUser,
  } from "../utils/chatManagement.js";
  import { blocks, friends } from "../stores/settings.js";
  import Modal from "./Modal.svelte";
  import dayjs from "dayjs";
  export let pos = { x: 0, y: 0 };
  export let uid = 0;
  export let displayname = "";
  export let userLogin = "";
  export let channel = "";

  export let banUser: (username: string, expires: Date) => void;
  export let muteUser: (username: string, expires: Date) => void;
  export let addAdmin: (userLogin: string) => void;

  const dispatch = createEventDispatcher();

  let menu: HTMLElement;
  let muteModal: HTMLElement;
  let banModal: HTMLElement;
  let muteCheckbox: HTMLElement;
  let banCheckbox: HTMLElement;

  let time: Date;
  let infinite = true;

  const onPageClick = (e: MouseEvent) => {
    if (!menu || e.target === menu || menu.contains(e.target as Node)) return;
    if (!muteCheckbox || e.target === muteCheckbox) return;
    if (!banCheckbox || e.target === banCheckbox) return;
    if (
      !muteModal ||
      e.target === muteModal ||
      muteModal.contains(e.target as Node)
    )
      return;
    if (
      !banModal ||
      e.target === banModal ||
      banModal.contains(e.target as Node)
    )
      return;

    dispatch("clickoutside");
  };
</script>

<svelte:body on:click={onPageClick} />
{#if $id !== uid}
  <ul
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
      <li class="text-error">
        <button on:click={() => unblockUser(uid)}>Unblock {displayname}</button>
      </li>
    {:else}
      <li class="text-error">
        <button on:click={() => blockUser(uid)}>Block {displayname}</button>
      </li>
    {/if}
    {#await hasAdminRights(uid, channel) then admin}
      {#if admin}
        <li class="text-error">
          <label for="ban-modal" class="modal-button">Ban {displayname}</label>
          <!--          <button on:click={() => banUser(userLogin)}>Ban {displayname}</button>-->
        </li>
        <li class="text-error">
          <label for="mute-modal" class="modal-button">Mute {displayname}</label
          >
        </li>
        <li>
          <button on:click={() => addAdmin(userLogin)}
            >Add {displayname} as Admin</button
          >
        </li>
      {/if}
    {/await}
  </ul>
{/if}

<Modal
  bind:inputElement={banCheckbox}
  bind:modalElement={banModal}
  id="ban-modal"
>
  <svelte:fragment slot="content">
    <div class="flex flex-col gap-4">
      <h3 class="text-lg font-bold">End of Ban</h3>
      <label class="label cursor-pointer">
        <span class="label-text">Infinite</span>
        <input type="checkbox" bind:checked={infinite} class="checkbox" />
      </label>
      {#if !infinite}
        <input
          bind:value={time}
          type="datetime-local"
          class="select select-bordered"
        />
      {/if}
      <button
        class="btn btn-error"
        on:click={() => {
          banUser(userLogin, infinite ? time : dayjs(0).toDate());
        }}>Ban {displayname}</button
      >
    </div>
  </svelte:fragment>
</Modal>

<Modal
  bind:inputElement={muteCheckbox}
  bind:modalElement={muteModal}
  id="mute-modal"
>
  <svelte:fragment slot="content">
    <div class="flex flex-col gap-4">
      <h3 class="text-lg font-bold">End of Mute</h3>

      <label class="label cursor-pointer">
        <span class="label-text">Infinite</span>
        <input type="checkbox" bind:checked={infinite} class="checkbox" />
      </label>
      {#if !infinite}
        <input
          bind:value={time}
          type="datetime-local"
          class="select select-bordered"
        />
      {/if}

      <button
        class="btn-error btn"
        on:click={() => {
          muteUser(userLogin, infinite ? time : dayjs(0).toDate());
        }}>Mute {displayname}</button
      >
    </div>
  </svelte:fragment>
</Modal>
