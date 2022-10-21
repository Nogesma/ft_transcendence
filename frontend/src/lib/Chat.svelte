<script lang="ts">
  import { displayname, login, id } from "../stores/settings";
  import { push, replace } from "svelte-spa-router";
  import type { Socket } from "socket.io-client";
  import { acceptInvite, sendInvite } from "../utils/gameInvite.js";
  import {
    addAdmin,
    banUser,
    isAdmin,
    muteUser,
    removeAdmin,
  } from "../utils/chatManagement.js";
  import { chatSocket } from "../stores/settings.js";
  import { getUserInfo } from "../utils/info.js";
  import { onDestroy } from "svelte";
  import type { Message, MessageList } from "../chat";
  import Messages from "./Messages.svelte";
  import ProfilePic from "./ProfilePic.svelte";
  import { pick } from "ramda";
  import LeftClickMenu from "./LeftClickMenu.svelte";

  export let channel: string;
  export let p = false;

  let invite: { id: number; type: boolean; displayname: string } | undefined;

  export let messagesList: MessageList = [];

  const registerListeners = (socket: Socket) => {
    socket.on("newInvite", (event) => (invite = event));

    socket.on("newMessage", (event: Message) => {
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

    socket.on("muted", (chan) => {
      if (channel === chan) {
        messagesList.push({
          message: `You have been muted.`,
          login: "",
          displayname: "",
          id: 0,
        });
        messagesList = messagesList;
      }
    });

    socket.on("banned", (chan) => {
      if (channel === chan) {
        alert("You have been banned.");
        replace("/");
      }
    });

    socket.on("channelDeleted", () => {
      alert("Channel has been deleted.");
      p ? push("/chat") : (channel = "");
    });
  };

  const emitLeave = (socket: Socket) => socket.emit("leaveRooms");

  const leaveChat = (socket: Socket) => {
    emitLeave(socket);
    p ? push("/chat") : (channel = "");
  };

  let connectedMembers = new Set<number>();

  const sendMessage = (message: string) => {
    if (!message || message.length === 0) return;

    $chatSocket.emit("sendMessage", { channel, msg: message });
    messagesList.push({
      message,
      login: $login,
      displayname: $displayname,
      id: $id,
    });
    messagesList = messagesList;
  };

  $: addAdminC = addAdmin(channel);
  $: removeAdminC = removeAdmin(channel);
  $: banUserC = banUser($chatSocket, channel);
  $: muteUserC = muteUser($chatSocket, channel);

  $: acceptInviteC = acceptInvite($chatSocket, channel);
  $: sendInviteC = sendInvite($chatSocket, channel);

  registerListeners($chatSocket);

  $: $chatSocket.emit("joinRoom", { channel });

  onDestroy(() => emitLeave($chatSocket));

  let showMenu = -1;
  let pos = { x: 0, y: 0 };

  const openMenu = (e: MouseEvent, i: number) => {
    pos = pick(["x", "y"])(e);
    showMenu = i;
  };

  let message = "";
</script>

<div class="flex flex-col h-full base-100 overflow-auto m-2">
  <div class="flex flex-row gap-4 h-fit overflow-x-auto overflow-y-hidden">
    <div class="text-5xl align-text-top font-bold text-primary">
      {channel}
    </div>
    {#each [...connectedMembers.values()] as spec, i}
      {#await getUserInfo(spec) then { login }}
        <button
          class="btn btn-ghost btn-circle avatar"
          on:click|preventDefault={(e) => openMenu(e, i)}
        >
          <ProfilePic user={login} attributes="h-10 w-10 rounded-full" />
        </button>
        {#if showMenu === i}
          <LeftClickMenu
            on:click={() => (showMenu = -1)}
            on:clickoutside={() => (showMenu = -1)}
            uid={spec}
            {pos}
          />
        {/if}
      {/await}
    {/each}
  </div>

  <Messages
    {messagesList}
    {p}
    {invite}
    {channel}
    banUser={banUserC}
    muteUser={muteUserC}
    addAdmin={addAdminC}
    removeAdmin={removeAdminC}
    acceptInvite={acceptInviteC}
  />

  <div
    class="flex flex-row content-center h-fit gap-4 flex-wrap mt-4 justify-center"
  >
    <form
      class="form-control self-center flex flex-auto"
      on:submit|preventDefault={() => {
        sendMessage(message);
        message = "";
      }}
    >
      <label class="input-group">
        <input
          type="text"
          bind:value={message}
          class="input input-bordered w-full"
        />
        <button class="btn btn-primary" type="submit">Send</button>
      </label>
    </form>

    <button
      class="btn w-24 m-1 self-center"
      on:click={() => sendInviteC(false)}
    >
      classic</button
    >
    <button class="btn w-24 m-1 self-center" on:click={() => sendInviteC(true)}>
      modified</button
    >
    {#await isAdmin(channel) then bool}
      {#if bool}
        <button
          class="btn rounded w-24 m-1 self-center"
          on:click={() => push(`/admin/chat/${channel}`)}
        >
          Manage channel</button
        >
      {/if}
    {/await}

    <button
      class="btn w-24 m-1 self-center"
      on:click={() => leaveChat($chatSocket)}
    >
      leave chat</button
    >
  </div>
</div>
