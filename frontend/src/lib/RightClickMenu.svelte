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
  import { push } from "svelte-spa-router";

  export let pos = { x: 0, y: 0 };
  export let uid = 0;
  export let displayname = "";
  export let userLogin = "";
  export let channel: string | undefined;

  export let banUser: (username: string, expires: Date) => void;
  export let muteUser: (username: string, expires: Date) => void;
  export let addAdmin: (userLogin: string) => void;
  export let removeAdmin: (userLogin: string) => void;

  const dispatch = createEventDispatcher();

  let muteModal: HTMLElement;
  let banModal: HTMLElement;
  let muteCheckbox: HTMLElement;
  let banCheckbox: HTMLElement;

  let time: Date;
  let infinite = true;

  const onPageClick = (e: MouseEvent) => {
    if ((e.target as Element).classList.contains("click")) return;
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

  $: disabled = infinite || time;
</script>

<svelte:body on:click={onPageClick} />
{#if $id !== uid}
  <ul
    style="top: {pos.y}px; left: {pos.x}px;"
    class="menu p-2 shadow bg-base-100 rounded-box w-52 absolute grid z-40"
  >
    {#if channel}
      <li>
        <button on:click={() => push(`/pm/${uid}`)}>Message</button>
      </li>
    {/if}
    {#if $friends.has(uid)}
      <li class="text-error">
        <button on:click={() => delFriend(uid)}>Remove friend</button>
      </li>
    {:else}
      <li>
        <button on:click={() => addFriend(userLogin)}>Add friend</button>
      </li>
    {/if}

    <!-- Will probably never happen as the user will not see any message from blocked users -->
    {#if $blocks.has(uid)}
      <li class="text-error">
        <button on:click={() => unblockUser(uid)}>Unblock {displayname}</button>
      </li>
    {:else}
      <li class="text-error">
        <button on:click={() => blockUser(uid)}>Block {displayname}</button>
      </li>
    {/if}
    {#if channel}
      {#await hasAdminRights(uid, channel) then [admin, isuidadmin]}
        {#if admin}
          <li class="text-error">
            <label for="ban-modal" class="modal-button click"
              >Ban {displayname}</label
            >
            <!--          <button on:click={() => banUser(userLogin)}>Ban {displayname}</button>-->
          </li>
          <li class="text-error">
            <label for="mute-modal" class="modal-button click"
              >Mute {displayname}</label
            >
          </li>
          {#if isuidadmin}
            <li>
              <button on:click={() => removeAdmin(userLogin)}
                >Remove {displayname} as Admin</button
              >
            </li>
          {:else}
            <li>
              <button on:click={() => addAdmin(userLogin)}
                >Add {displayname} as Admin</button
              >
            </li>
          {/if}
        {/if}
      {/await}
    {/if}
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
      <label
        for="ban-modal"
        class="btn btn-error {disabled ? '' : 'btn-disabled'}"
        on:click={() => {
          banUser(userLogin, infinite ? dayjs(0).toDate() : time);
        }}
        on:keypress={() => {
          banUser(userLogin, infinite ? dayjs(0).toDate() : time);
        }}>Ban {displayname}</label
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

      <label
        for="mute-modal"
        class="btn-error btn  {disabled ? '' : 'btn-disabled'}"
        on:click={() => {
          muteUser(userLogin, infinite ? dayjs(0).toDate() : time);
        }}
        on:keypress={() => {
          muteUser(userLogin, infinite ? dayjs(0).toDate() : time);
        }}>Mute {displayname}</label
      >
    </div>
  </svelte:fragment>
</Modal>
