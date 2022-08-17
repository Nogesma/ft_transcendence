<script lang="ts">
  import { onMount } from "svelte";
  import { chatSocket } from "../utils/socket";
  import axios from "axios";
  import { displayname, login, id } from "../stores/settings";
  import ProfilePic from "./ProfilePic.svelte";
  import { push } from "svelte-spa-router";
  import type { Socket } from "socket.io-client";
  import { acceptInvite, sendInvite } from "../utils/gameInvite.js";
  import {
    banUser,
    muteUser,
    unbanUser,
    unmuteUser,
  } from "../utils/chatManagement.js";

  export let channel = "";
  let invite: { id: number; type: boolean; displayname: string } | undefined;

  // List chat
  const getChannels = () =>
    axios.get(`${import.meta.env.VITE_BACKEND_URI}/api/chat/channels`, {
      withCredentials: true,
    });

  let msg: string;
  let messagesList: Array<{
    message: string;
    login: string;
    displayname: string;
    id: number;
  }> = [];

  const sendpm = (
    name: string,
    uid: number,
    nbr: number,
    displayname: string
  ) => {
    console.log(uid, nbr, displayname); // simply justifying use of this variable for the check, might be or not be used for pms
    let str = $login;
    if (str === name) {
      alert("you cannot send a pm to yourself");
      return;
    }
    socket.emit("sendpm", { name, str });
  };

  /* const addAdmin = (name: string) => {
    if (name === $login) {
      alert("You cannot promote yourself as admin");
      return;
    }
    axios.post(
      `${import.meta.env.VITE_BACKEND_URI}/api/chat/add_admin/${name}`,
      {
        chan: channel,
      },
      {
        withCredentials: true,
      }
    );
  }; */

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
    socket.emit("sendMessage", { channel, msg });
    messagesList.push({
      message: msg,
      login: $login,
      displayname: $displayname,
      id: $id,
    });
    messagesList = messagesList;
    msg = "";
  };

  const socket = chatSocket();

  onMount(() => {
    registerListeners(socket);
    socket.emit("joinRoom", { channel });
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
                      channel = name;
                      socket.close();
                      socket.open();
                      socket.emit("joinRoom", { channel });
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
            {#each messagesList as { displayname, message, login: userLogin, id }, ina}
              <ul class="space-y-2">
                <!--              TODO -> when others send message justify start-->
                <!--              <li class="flex justify-start">-->
                <!--                <div class="relative max-w-xl px-4 py-2 text-gray-700 rounded shadow">-->
                <!--                  <span class="block">{message}</span>-->
                <!--                </div>-->
                <!--              </li>-->
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
                      <li
                        class="text-gray-50"
                        on:click={() => banUser(userLogin, $login, channel)}
                      >
                        Ban {userLogin}
                      </li>
                      <li
                        class="text-gray-50"
                        on:click={() => muteUser(userLogin, $login, channel)}
                      >
                        Mute {userLogin}
                      </li>
                      <li
                        class="text-gray-50"
                        on:click={() => unbanUser(userLogin, channel)}
                      >
                        Unban {userLogin}
                      </li>
                      <li
                        class="text-gray-50"
                        on:click={() => unmuteUser(userLogin, channel)}
                      >
                        Unmute {userLogin}
                      </li>
                      <li
                        class="text-gray-50"
                        on:click={() => sendpm(userLogin, id, ina, displayname)}
                      >
                        Sendpm {userLogin}
                      </li>
                      <!--                          <li><button on:click={sendmsg}>Logout</button></li>-->
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
                  if (invite) acceptInvite(socket, channel, invite);
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
              on:click={() => sendInvite(socket, channel, false)}
            >
              classic
            </button>
            <button
              type="invite"
              on:click={() => sendInvite(socket, channel, false)}
            >
              modified
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
