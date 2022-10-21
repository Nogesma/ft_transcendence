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
        console.log("channelInfo", { memberList });
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
</script>

<div class="flex flex-col h-full base-100 rounded-md overflow-auto">
  <div class="px-4 sm:px-6">
    <h2 class="text-lg font-medium text-gray-100" id="slide-over-title">
      {channel}
    </h2>
  </div>
  <span class="m-2">Active users:</span>
  <div
    class="flex flex-auto px-4 sm:px-6 mt-6 overflow-auto justify-left origin-center h-80 border border-primary m-2 p-2 bg-base-100"
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

  <Messages
    {messagesList}
    {p}
    {invite}
    {channel}
    {sendMessage}
    banUser={banUserC}
    muteUser={muteUserC}
    addAdmin={addAdminC}
    removeAdmin={removeAdminC}
    acceptInvite={acceptInviteC}
    sendInvite={sendInviteC}
  />

  <div class="flex">
    {#await isAdmin(channel) then bool}
      {#if bool}
        <button
          class="btn rounded w-24 m-1"
          on:click={() => push(`/admin/chat/${channel}`)}
        >
          Manage channel</button
        >
      {/if}
    {/await}

    <button class="btn w-24 m-1" on:click={() => leaveChat($chatSocket)}>
      leave chat</button
    >
  </div>
</div>
