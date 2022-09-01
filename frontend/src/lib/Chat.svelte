<script lang="ts">
  import { displayname, login, id, pmSocket } from "../stores/settings";
  import ProfilePic from "./ProfilePic.svelte";
  import { push } from "svelte-spa-router";
  import type { Socket } from "socket.io-client";
  import { acceptInvite, sendInvite } from "../utils/gameInvite.js";
  import {
    addAdmin,
    banUser,
    isAdmin,
    isBanned,
    isMuted,
    muteUser,
    removeAdmin,
    unbanUser,
    unmuteUser,
  } from "../utils/chatManagement.js";
  import { chatSocket } from "../stores/settings.js";

  export let channel: string;

  let invite: { id: number; type: boolean; displayname: string } | undefined;

  let msg: string;
  let pmmsg: string;
  let messagesList: Array<{
    message: string;
    login: string;
    displayname: string;
    id: number;
  }> = [];

  const sendpm = (uid: number) =>
    $pmSocket.emit("sendpm", {
      id: uid,
      pmmsg,
    });

  $pmSocket.on("pm", (event) => {
    let pm: {
      msg: string;
      displayname: string;
    };
    pm = event;
    alert(`${pm.displayname} has sent you a message: ${pm.msg}`);
  });

  const registerListeners = (socket: Socket) => {
    socket.on("newInvite", (event) => (invite = event));

    socket.on("newMessage", (event) => {
      messagesList.push(event);
      messagesList = messagesList;
    });

    socket.on("newCustomGame", ({ p1, p2, type }) => {
      invite = undefined;
      console.log({ p1, p2, type });
      if ($id === p1) push(`#/game/custom.${type}.${p2}`);
      if ($id === p2) push(`#/game/custom.${type}.${p1}`);
    });
  };
  const banpm = (banid: number) => {
    $pmSocket.emit("ban", { id: banid });
  };
  const unbanpm = (banid: number) => {
    $pmSocket.emit("unban", { id: banid });
  };
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

  $: banUserC = banUser($chatSocket, channel);
  $: muteUserC = muteUser($chatSocket, channel);
  $: unBanUserC = unbanUser($chatSocket, channel);
  $: unMuteUserC = unmuteUser($chatSocket, channel);
  $: addAdminC = addAdmin(channel);
  $: removeAdminC = removeAdmin(channel);

  $: isBannedC = isBanned(channel);
  $: isMutedC = isMuted(channel);
  $: isAdminC = isAdmin(channel);

  $: acceptInviteC = acceptInvite($chatSocket, channel);
  $: sendInviteC = sendInvite($chatSocket, channel);

  registerListeners($chatSocket);

  $: $chatSocket.emit("joinRoom", { channel });
</script>

<div class="px-4 sm:px-6">
  <h2 class="text-lg font-medium text-gray-900" id="slide-over-title">
    {channel}
  </h2>
</div>
<div class="relative mt-6 flex-1 px-4 sm:px-6">
  {#each messagesList as { displayname, message, login: userLogin, id }}
    <!--            <label tabindex="0" class="" for="unused">{ina + 1}: {displayname}</label>: {message}-->
    <ul class="space-y-2">
      <!--              TODO -> when others send message justify start-->
      <!--              <li class="flex justify-start">-->
      <!--                <div class="relative max-w-xl px-4 py-2 text-gray-700 rounded shadow">-->
      <!--                  <span class="block">{message}</span>-->
      <!--                </div>-->
      <!--              </li>-->

      <li class="flex justify-end space-x-3 h-fit p-1 static">
        <div class="dropdown dropdown-end">
          <div
            tabindex="0"
            class="btn btn-ghost btn-circle avatar justify-start"
          >
            {displayname}
            <!--            <ProfilePic user={userLogin} attributes="h-8 w-8 rounded-full" />-->
          </div>
          <ul
            tabindex="0"
            class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-green-400 rounded-box w-52"
          >
            {#await isBannedC(userLogin) then banned}
              {#if banned}
                <li class="text-gray-50" on:click={() => banUserC(userLogin)}>
                  Ban {displayname}
                </li>
              {:else}
                <li class="text-gray-50" on:click={() => unBanUserC(userLogin)}>
                  Unban {displayname}
                </li>
              {/if}
            {/await}
            {#await isMutedC(userLogin) then muted}
              {#if muted}
                <li class="text-gray-50" on:click={() => muteUserC(userLogin)}>
                  Mute {displayname}
                </li>
              {:else}
                <li
                  class="text-gray-50"
                  on:click={() => unMuteUserC(userLogin)}
                >
                  Unmute {displayname}
                </li>
              {/if}
            {/await}
            {#await isAdminC(userLogin) then admin}
              {#if admin}
                <li class="text-gray-50" on:click={() => addAdminC(userLogin)}>
                  Add {displayname} as Admin
                </li>
              {:else}
                <li
                  class="text-gray-50"
                  on:click={() => removeAdminC(userLogin)}
                >
                  Remove {displayname} as Admin
                </li>
              {/if}
            {/await}
            <li class="text-gray-50" on:click={() => banUserC(userLogin)}>
              Ban {displayname}
            </li>
            <li class="text-gray-50" on:click={() => muteUserC(userLogin)}>
              Mute {displayname}
            </li>
            <li class="text-gray-50" on:click={() => unBanUserC(userLogin)}>
              Unban {displayname}
            </li>
            <li class="text-gray-50" on:click={() => unMuteUserC(userLogin)}>
              Unmute {displayname}
            </li>
            <li class="text-gray-50" on:click={() => push(`/users/${id}`)}>
              View profile
            </li>
            <li class="text-gray-50" on:click={() => banpm(id)}>
              Block {displayname}
            </li>
            <li class="text-gray-50" on:click={() => unbanpm(id)}>
              UnBlock {displayname}
            </li>
            <li class="text-gray-50" on:click={() => sendpm(id)}>
              Sendpm {displayname}
            </li>
            <input
              type="text"
              placeholder="PmMessage"
              class="block w-full py-2 pl-4 mx-3 bg-gray-100 rounded-full outline-none focus:text-gray-700"
              name="pmmessage"
              required
              bind:value={pmmsg}
            />
          </ul>
          <div
            class="max-w-xl px-4 py-1 text-gray-700 bg-gray-100 rounded shadow static"
          >
            <span class="block inline-block text-center justify-end"
              >{message}</span
            >
          </div>
        </div>
      </li>
    </ul>
  {/each}
  {#if invite}
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
  <button class="btn" on:click={() => sendInviteC(false)}> classic </button>
  <button class="btn" on:click={() => sendInviteC(true)}> modified </button>
  <div
    class="flex items-center justify-between w-full p-3 border-t border-gray-300"
  >
    <input
      type="text"
      placeholder="Message"
      class="block w-full py-2 pl-4 mx-3 bg-gray-100 rounded-full outline-none focus:text-gray-700"
      name="message"
      required
      bind:value={msg}
    />
    <button type="submit" on:click={sendmsg}>
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
  </div>
</div>
