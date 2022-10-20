<script lang="ts">
  import { displayname, login, id } from "../stores/settings";
  import { push } from "svelte-spa-router";
  import type { Socket } from "socket.io-client";
  import { acceptInvite, sendInvite } from "../utils/gameInvite.js";
  import {
    addAdmin,
    banUser,
    isAdmin,
    muteUser,
  } from "../utils/chatManagement.js";
  import { blocks, chatSocket } from "../stores/settings.js";
  import { getUserInfo } from "../utils/info.js";
  import RightClickMenu from "./RightClickMenu.svelte";
  import { pick } from "ramda";
  import LeftClickMenu from "./LeftClickMenu.svelte";

  export let channel: string;
  export let p = false;

  let invite: { id: number; type: boolean; displayname: string } | undefined;

  let msg: string;
  export let messagesList: Array<{
    message: string;
    login: string;
    displayname: string;
    id: number;
  }> = [];
  const registerListeners = (socket: Socket) => {
    socket.on("newInvite", (event) => (invite = event));

    socket.on("newMessage", (event) => {
      messagesList.push(event);
      messagesList = messagesList;
    });

    socket.on("newCustomGame", ({ p1, p2, type }) => {
      invite = undefined;
      if ($id === p1) push(`#/game/custom.${type}.${p2}`);
      if ($id === p2) push(`#/game/custom.${type}.${p1}`);
    });

    socket.on(
      "channelInfo",
      ({ memberList }: { memberList: Array<number> }) => {
        if (!memberList) return leaveChat(socket);
        connectedMembers = new Set(memberList);
      }
    );

    socket.on("newMember", ({ displayname, id }) => {
      connectedMembers.add(id);
      messagesList.push({
        message: `${displayname} joined.`,
        login: "",
        displayname: "",
        id: 0,
      });

      messagesList = messagesList;
      connectedMembers = connectedMembers;
    });

    socket.on("delMember", ({ displayname, id }) => {
      connectedMembers.delete(id);
      messagesList.push({
        message: `${displayname} left.`,
        login: "",
        displayname: "",
        id: 0,
      });

      messagesList = messagesList;
      connectedMembers = connectedMembers;
    });
  };

  const leaveChat = (socket: Socket) => {
    socket.emit("leaveRooms");
    p ? push("/chat") : (channel = "");
  };

  let connectedMembers = new Set<number>();

  const sendmsg = () => {
    if (!msg || msg.length === 0) return;
    $chatSocket.emit("sendMessage", { channel, msg });
    messagesList.push({
      message: msg,
      login: $login,
      displayname: $displayname,
      id: $id,
    });
    messagesList = messagesList;
    msg = "";
  };

  $: addAdminC = addAdmin(channel);
  $: banUserC = banUser($chatSocket, channel);
  $: muteUserC = muteUser($chatSocket, channel);

  $: acceptInviteC = acceptInvite($chatSocket, channel);
  $: sendInviteC = sendInvite($chatSocket, channel);

  registerListeners($chatSocket);

  $: $chatSocket.emit("joinRoom", { channel });

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

<div class="flex flex-col h-80 base-100 rounded-md">
  <div class="px-4 sm:px-6">
    <h2 class="text-lg font-medium text-gray-400" id="slide-over-title">
      {channel}
    </h2>
  </div>
  <span>Active users:</span>
  <div
    class="flex flex-auto justify-left origin-center h-6 border border-primary"
  >
    {#each [...connectedMembers.values()] as spec}
      <li>
        <ul class="m-1">
          {#await getUserInfo(spec) then { displayname: name }}
            {name}
          {/await}
        </ul>
      </li>
    {/each}
  </div>

  <div class="overflow-scroll h-full">
    <div
            class="mt-6 flex-1 px-4 sm:px-6 base-100 border border-primary basis-5/6 flex-grow-0"
    >
      {#each messagesList as { displayname, message, login: userLogin, id: uid }, i}
        {#if $blocks.has(uid) === false || $id === uid}
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
                    banUser={banUserC}
                    muteUser={muteUserC}
                    addAdmin={addAdminC}
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
            if (invite) acceptInviteC(invite);
          }}
          >
            Accept
          </button>
        </div>
      {/if}
    </div>

  </div>
  <div class="flex">
    <button class="btn-secondary rounded w-24 m-1" on:click={() => sendInviteC(false)}>
      classic</button
    >
    {#await isAdmin(channel) then bool}
      {#if bool}
        <button
                class="btn-secondary rounded w-24 m-1"
                on:click={() => push(`/admin/chat/${channel}`)}
        >
          Manage channel</button
        >
      {/if}
    {/await}
    <button class="btn-secondary rounded w-24 m-1" on:click={() => sendInviteC(true)}>
      modified</button
    >
    <button class="btn-secondary rounded w-24 m-1" on:click={() => leaveChat($chatSocket)}>
      leave chat</button
    >
  </div>
    <div class="flex rounded base-100 p-2">
      <form class="form-control" on:submit|preventDefault={sendmsg}>
        <label class="input-group">
          <input
                  bind:value={msg}
                  type="text"
                  class="input border-primary rounded w-96 h-6"
          />
          <button type="submit">
            <svg
                    class="w-5 h-5 text-primary origin-center transform rotate-90"
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

</div>


<!--*{-->
<!--        margin: 0;-->
<!--        padding: 0;-->
<!--}-->
<!--div{-->
<!--        background-color: aquamarine;-->
<!--        border: 1px solid black;-->
<!--}-->
<!--body{-->
<!--        display: flex;-->
<!--        flex-direction:column;-->
<!--        gap: 2em;-->
<!--}-->
<!--body >div{-->
<!--        flex:1;-->
<!--}-->
<!--.div3-->
<!--{-->
<!--        overflow:scroll;-->
<!--}-->
<!--body{-->
<!--        height: 100vh;-->
<!--}-->

<!--<!DOCTYPE html>-->
<!--<html>-->
<!--<head>-->
<!--  <link rel = "stylesheet" href="./style.css" type="text/css">-->
<!--</head>-->
<!--<body>-->
<!--<div class="div1">-->

<!--</div>-->
<!--<div class="div2">-->

<!--</div>-->
<!--<div class="div3" contenteditable="true">-->

<!--</div>-->
<!--</body>-->
<!--</html>-->
