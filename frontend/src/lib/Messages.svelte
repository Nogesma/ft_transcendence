<script lang="ts">
  import { blocks, id } from "../stores/settings.js";
  import LeftClickMenu from "./LeftClickMenu.svelte";
  import { identity, pick } from "ramda";
  import RightClickMenu from "./RightClickMenu.svelte";
  import type { MessageList } from "../chat";

  export let messagesList: MessageList = [];
  export let p: boolean;
  export let invite:
    | { id: number; type: boolean; displayname: string }
    | undefined = undefined;
  export let channel: string | undefined = undefined;
  export let banUser: (username: string, expires: Date) => void = identity;
  export let muteUser: (username: string, expires: Date) => void = identity;
  export let addAdmin: (userLogin: string) => void = identity;
  export let removeAdmin: (userLogin: string) => void = identity;

  export let acceptInvite: ({
    id,
    type,
  }: {
    id: number;
    type: boolean;
  }) => void;

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

<!--      <div class="clearfix">-->
<!--          <div-->
<!--            class="bg-gray-300 w-3/4 mx-4 my-2 p-2 rounded-lg"-->
<!--          >this is a basic mobile chat layout, build with tailwind css</div>-->
<!--        </div>-->

<!--        &lt;!&ndash; SINGLE MESSAGE 2 &ndash;&gt;-->
<!--        <div class="clearfix">-->
<!--          <div-->
<!--            class="bg-gray-300 w-3/4 mx-4 my-2 p-2 rounded-lg clearfix"-->
<!--          >It will be used for a full tutorial about building a chat app with vue, tailwind and firebase.</div>-->
<!--        </div>-->

<!--        &lt;!&ndash; SINGLE MESSAGE 3 &ndash;&gt;-->
<!--        <div class="clearfix">-->
<!--          <div-->
<!--            class="bg-green-300 float-right w-3/4 mx-4 my-2 p-2 rounded-lg clearfix"-->
<!--          >check my twitter to see when it will be released.</div>-->
<!--        </div>-->
<!--      </div>-->

<div
  id="scroller"
  class="flex flex-col bg-base-200 rounded-box h-full basis-5/6 overflow-auto mt-2"
>
  {#each messagesList as { displayname, message, login: userLogin, id: uid }, i}
    <div class="flex flex-col m-2">
      {#if !$blocks.has(uid)}
        {#if displayname}
          <button
            class="{$id === uid ? 'text-right' : 'text-left'} hover:underline"
            on:contextmenu|preventDefault={(e) => openMenu(e, i)}
            on:click|preventDefault={(e) => openMenu(e, i)}
          >
            {displayname}
          </button>
        {/if}

        <div
          class="break-all {$id === uid
            ? 'self-end'
            : 'text-left self-start'} w-fit bg-base-100 p-2 mt-1 rounded-lg"
        >
          {message}
        </div>

        {#if i === cardIndex}
          <LeftClickMenu
            on:clickoutside={() => (cardIndex = -1)}
            {uid}
            {pos}
            dir={!(p && $id === uid)}
          />
        {/if}

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
            {removeAdmin}
          />
        {/if}
      {/if}
    </div>
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
  <div class="flex p-2" id="anchor" />
</div>

<style>
  #scroller * {
    overflow-anchor: none;
  }

  #anchor {
    overflow-anchor: auto;
    height: 1px;
  }
</style>
