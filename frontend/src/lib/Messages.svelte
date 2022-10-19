<script lang="ts">
  import { blocks, id } from "../stores/settings.js";
  import LeftClickMenu from "./LeftClickMenu.svelte";
  import { identity, pick } from "ramda";
  import RightClickMenu from "./RightClickMenu.svelte";
  import type { MessageList } from "../chat";

  export let messagesList: MessageList = [];
  export let p = false;
  export let invite:
    | { id: number; type: boolean; displayname: string }
    | undefined;
  export let channel: string | undefined;
  export let sendMessage: (message: string) => void;
  export let banUser: (username: string, expires: Date) => void = identity;
  export let muteUser: (username: string, expires: Date) => void = identity;
  export let addAdmin: (userLogin: string) => void = identity;
  export let acceptInvite: ({
    id,
    type,
  }: {
    id: number;
    type: boolean;
  }) => void;

  let message: string;
  let cardIndex = -1;
  let menuIndex = -1;
  let pos = { x: 0, y: 0 };

  const openMenu = (e: MouseEvent, i: number) => {
    pos = pick(["x", "y"])(e);
    if (e.button === 2) {
      cardIndex = -1;
      menuIndex = i;
    } else {
      menuIndex = -1;
      cardIndex = i;
    }
  };
</script>

<div
  class="flex-1 px-4 sm:px-6 bg-gray-600 border border-blue-400 max-h-full basis-5/6 overflow-auto"
>
  {#each messagesList as { displayname, message, login: userLogin, id: uid }, i}
    {#if !$blocks.has(uid)}
      <ul class="space-y-2">
        <li
          class="flex {$id === uid
            ? 'justify-end'
            : 'justify-start'} space-x-3 h-fit p-1 static"
        >
          <button
            class="{$id === uid ? 'text-right' : 'text-left'} hover:underline"
            on:contextmenu|preventDefault={(e) => openMenu(e, i)}
            on:click|preventDefault={(e) => openMenu(e, i)}
          >
            {displayname}
          </button>

          {#if i === cardIndex}
            <LeftClickMenu
              on:clickoutside={() => (cardIndex = -1)}
              {uid}
              {pos}
              dir={!(p && $id === uid)}
            />
          {/if}
          <div
            class="max-w-xl px-4 py-1 text-gray-700 bg-gray-100 rounded shadow static"
          >
            <span class="block inline-block text-center justify-end">
              {message}
            </span>
          </div>
        </li>
      </ul>
      {#if i === menuIndex}
        <RightClickMenu
          on:clickoutside={() => (menuIndex = -1)}
          {pos}
          {uid}
          {displayname}
          {userLogin}
          {channel}
          {banUser}
          {muteUser}
          {addAdmin}
        />
      {/if}
    {/if}
  {/each}
  {#if invite && !$blocks.has(invite.id)}
    <div>
      {invite.displayname} invited you for a {invite.type
        ? "modified"
        : "classic"} pong game!
      <button
        class="btn {invite.id === $id ? 'btn-disabled' : ''}"
        on:click={() => {
          if (invite) acceptInvite(invite);
        }}
      >
        Accept
      </button>
    </div>
  {/if}
</div>

<div class="flex rounded bg-base-200 p-2">
  <form
    class="form-control"
    on:submit|preventDefault={() => {
      sendMessage(message);
      message = "";
    }}
  >
    <label class="input-group">
      <input
        bind:value={message}
        type="text"
        class="input bg-base-200 w-96 h-6"
      />
      <button type="submit">
        <svg
          class="w-5 h-5 text-gray-500 origin-center transform rotate-90"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
          />
        </svg>
      </button>
    </label>
  </form>
</div>
