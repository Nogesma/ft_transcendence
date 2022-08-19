<script lang="ts">
  import { onMount } from "svelte";
  import axios from "axios";
  import { displayname, login, id, pmSocket } from "../stores/settings";
  import ProfilePic from "../lib/ProfilePic.svelte";
  import { params, push } from "svelte-spa-router";
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

  $: channel = $params?.id ?? "";

  let invite: { id: number; type: boolean; displayname: string } | undefined;

  // List chat
  const getChannels = () =>
    axios.get(`${import.meta.env.VITE_BACKEND_URI}/api/chat/channels`, {
      withCredentials: true,
    });

  let msg: string;
  let pmmsg: string;
  let messagesList: Array<{
    message: string;
    login: string;
    displayname: string;
    id: number;
  }> = [];

  const sendpm = (name: string) =>
    $pmSocket.emit("sendpm", { name, str: $login, pmmsg });

  $pmSocket.on("pm", (event) => {
    let pm: {
      msg: string;
      login: string;
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

    socket.on("pm", (event) => {
      console.log("test");
      alert(event);
    });

    socket.on("newCustomGame", ({ p1, p2, type }) => {
      invite = undefined;
      console.log({ p1, p2, type });
      if ($id === p1) push(`#/game/custom.${type}.${p2}`);
      if ($id === p2) push(`#/game/custom.${type}.${p1}`);
    });
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

  onMount(() => {
    registerListeners($chatSocket);
    $chatSocket.emit("joinRoom", { channel });
  });
</script>

<body>
  <div class="container mx-auto">
    <div class="min-w-full border rounded lg:grid lg:grid-cols-3">
      <div class="border-r border-gray-300 lg:col-span-1">
        <div class="mx-3 my-3">
          <div class="relative text-gray600">
            <span class="absolute inset-y-0 left-0 flex items-center pl-2">
              <svg
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                class="w-6 h-6 text-gray-300"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="search"
              class="block w-full py-2 pl-10 bg-gray-100 rounded outline-none"
              name="search"
              placeholder="Search"
              required
            />
          </div>
        </div>
        <ul class="overflow-auto h-[32rem]">
          <li>
            <h2 class="my-2 mb-2 ml-2 text-lg text-gray-600">Chats</h2>
            {#await getChannels()}
              <p>waiting...</p>
            {:then { data }}
              {#each data as { name }}
                <div class="flex">
                  <a
                    href="/"
                    class="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b
                                            border-gray-300 cursor-pointer hover:bg-gray-100 focus:outline-none"
                    on:click={() => {
                      $chatSocket.close();
                      $chatSocket.open();
                      $chatSocket.emit("joinRoom", { channel });
                    }}
                  >
                    <img
                      class="object-cover w-10 h-10 rounded-full"
                      src="https://spaces-cdn.clipsafari.com/c7q6wksk9ojlezcan9cymncfoe70"
                      alt="username"
                    />
                    <div class="w-full pb-2">
                      <div class="flex justify-between">
                        <span class="block ml-2 font-semibold text-gray-600"
                          >{name}</span
                        >
                        <span class="block ml-2 text-sm text-gray-600" />
                        <!--  TODO -> last activity?-->
                      </div>
                      <span class="block ml-2 text-sm text-gray-600" />
                      <!--  TODO -> last message -->
                    </div>
                  </a>
                </div>
              {/each}
            {:catch err}
              <p>{err}</p>
            {/await}
          </li>
        </ul>
      </div>
      <div class="hidden lg:col-span-2 lg:block">
        <div class="w-full">
          <div class="relative flex items-center p-3 border-b border-gray-300">
            <img
              class="object-cover w-10 h-10 rounded-full"
              src="https://spaces-cdn.clipsafari.com/c7q6wksk9ojlezcan9cymncfoe70"
              alt="username"
            />
            <span class="block ml-2 font-bold text-gray-600">{channel}</span>
            <span
              class="absolute w-3 h-3 bg-green-600 rounded-full left-10 top-3"
            />
          </div>
          <div class="relative w-full p-6 overflow-y-auto h-[40rem]">
            {#each messagesList as { displayname, message, login: userLogin }}
              <ul class="space-y-2">
                <li class="flex justify-end space-x-3 h-fit p-1 static">
                  <div
                    class="max-w-xl px-4 py-1 text-gray-700 bg-gray-100 rounded shadow static"
                  >
                    <span class="block inline-block text-center justify-end"
                      >{message}</span
                    >
                  </div>
                  <div class="dropdown dropdown-end">
                    <div
                      tabindex="0"
                      class="btn btn-ghost btn-circle avatar justify-start"
                    >
                      <ProfilePic
                        user={userLogin}
                        attributes="h-8 w-8 rounded-full"
                      />
                    </div>
                    <ul
                      tabindex="0"
                      class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-green-400 rounded-box w-52"
                    >
                      {#await isBannedC(userLogin) then banned}
                        {#if banned}
                          <li
                            class="text-gray-50"
                            on:click={() => banUserC(userLogin)}
                          >
                            Ban {displayname}
                          </li>
                        {:else}
                          <li
                            class="text-gray-50"
                            on:click={() => unBanUserC(userLogin)}
                          >
                            Unban {displayname}
                          </li>
                        {/if}
                      {/await}
                      {#await isMutedC(userLogin) then muted}
                        {#if muted}
                          <li
                            class="text-gray-50"
                            on:click={() => muteUserC(userLogin)}
                          >
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
                          <li
                            class="text-gray-50"
                            on:click={() => addAdminC(userLogin)}
                          >
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
                      <li
                        class="text-gray-50"
                        on:click={() => banUserC(userLogin)}
                      >
                        Ban {userLogin}
                      </li>
                      <li
                        class="text-gray-50"
                        on:click={() => muteUserC(userLogin)}
                      >
                        Mute {userLogin}
                      </li>
                      <li
                        class="text-gray-50"
                        on:click={() => unBanUserC(userLogin)}
                      >
                        Unban {userLogin}
                      </li>
                      <li
                        class="text-gray-50"
                        on:click={() => unMuteUserC(userLogin)}
                      >
                        View profile
                      </li>
                      <li
                        class="text-gray-50"
                        on:click={() => sendpm(userLogin)}
                      >
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
                  </div>
                </li>
              </ul>
            {/each}
          </div>
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
            <button
              type="invite"
              class="mr-5"
              on:click={() => sendInviteC(false)}
            >
              classic
            </button>
            <button type="invite" on:click={() => sendInviteC(true)}>
              modified
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
