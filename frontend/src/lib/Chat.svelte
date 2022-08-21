<script lang="ts">
  import { onMount } from "svelte";
  import { chatSocket } from "../utils/socket";
  import { pmSocket } from "../utils/socket";
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
  let pmmsg: string;
  let messagesList: Array<{
    message: string;
    login: string;
    displayname: string;
    id: number;
  }> = [];

  const sendpm = (name: string) => {
    let str = $login;
    pmsocket.emit("sendpm", { name, str, pmmsg });
  };

  const removeAdmin = (name: string) => {
    axios.post(
      `${import.meta.env.VITE_BACKEND_URI}/api/chat/remove_admin/${name}`,
      {
        chan: channel,
      },
      {
        withCredentials: true,
      }
    );
  };

  const ismuted = (name: string) =>
    axios.post(
      `${import.meta.env.VITE_BACKEND_URI}/api/chat/is_muted/${name}`,
      {
        chan: channel,
      },
      {
        withCredentials: true,
      }
    );

  const is_admin = (name: string) => {
    return axios.post(
      `${import.meta.env.VITE_BACKEND_URI}/api/chat/is_admin/${name}`,
      {
        chan: channel,
      },
      {
        withCredentials: true,
      }
    );
  };

  const isbanned = (name: string) => {
    return axios.post(
      `${import.meta.env.VITE_BACKEND_URI}/api/chat/is_banned/${name}`,
      {
        chan: channel,
      },
      {
        withCredentials: true,
      }
    );
  };
  const addAdmin = (name: string) => {
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
  };

  const pmsocket = pmSocket();

  pmsocket.on("pm", (event) => {
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

<!--<body>-->
<!--  <div class="container mx-auto">-->
<!--    <div class="min-w-full border rounded lg:grid lg:grid-cols-3">-->
<!--      <div class="border-r border-gray-300 lg:col-span-1">-->
<!--        <div class="mx-3 my-3">-->
<!--          <div class="relative text-gray600">-->
<!--            <span class="absolute inset-y-0 left-0 flex items-center pl-2">-->
<!--              <svg-->
<!--                fill="none"-->
<!--                stroke="currentColor"-->
<!--                stroke-linecap="round"-->
<!--                stroke-linejoin="round"-->
<!--                stroke-width="2"-->
<!--                viewBox="0 0 24 24"-->
<!--                class="w-6 h-6 text-gray-300"-->
<!--              >-->
<!--                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />-->
<!--              </svg>-->
<!--            </span>-->
<!--            <input-->
<!--              type="search"-->
<!--              class="block w-full py-2 pl-10 bg-gray-100 rounded outline-none"-->
<!--              name="search"-->
<!--              placeholder="Search"-->
<!--              required-->
<!--            />-->
<!--          </div>-->
<!--        </div>-->
<!--        <ul class="overflow-auto h-[32rem]">-->
<!--          <li>-->
<!--            <h2 class="my-2 mb-2 ml-2 text-lg text-gray-600">Chats</h2>-->
<!--            {#await getChannels()}-->
<!--              <p>waiting...</p>-->
<!--            {:then { data }}-->
<!--              {#each data as { name }}-->
<!--                <div class="flex">-->
<!--                  <a-->
<!--                    href="/"-->
<!--                    class="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b-->
<!--                                            border-gray-300 cursor-pointer hover:bg-gray-100 focus:outline-none"-->
<!--                    on:click={() => {-->
<!--                      channel = name;-->
<!--                      socket.close();-->
<!--                      socket.open();-->
<!--                      socket.emit("joinRoom", { channel });-->
<!--                    }}-->
<!--                  >-->
<!--                    <img-->
<!--                      class="object-cover w-10 h-10 rounded-full"-->
<!--                      src="https://spaces-cdn.clipsafari.com/c7q6wksk9ojlezcan9cymncfoe70"-->
<!--                      alt="username"-->
<!--                    />-->
<!--                    <div class="w-full pb-2">-->
<!--                      <div class="flex justify-between">-->
<!--                        <span class="block ml-2 font-semibold text-gray-600"-->
<!--                          >{name}</span-->
<!--                        >-->
<!--                        <span class="block ml-2 text-sm text-gray-600" />-->
<!--                        &lt;!&ndash;  TODO -> last activity?&ndash;&gt;-->
<!--                      </div>-->
<!--                      <span class="block ml-2 text-sm text-gray-600" />-->
<!--                      &lt;!&ndash;  TODO -> last message &ndash;&gt;-->
<!--                    </div>-->
<!--                  </a>-->
<!--                </div>-->
<!--              {/each}-->
<!--            {:catch err}-->
<!--              <p>{err}</p>-->
<!--            {/await}-->
<!--          </li>-->
<!--        </ul>-->
<!--        </div>-->
<!--&lt;!&ndash;        <ul class="overflow-auto h-[32rem]">&ndash;&gt;-->
<!--&lt;!&ndash;            <li>&ndash;&gt;-->
<!--&lt;!&ndash;            <h2 class="my-2 mb-2 ml-2 text-lg text-gray-600">Chats</h2>&ndash;&gt;-->
<!--&lt;!&ndash;            {#await getChannels()}&ndash;&gt;-->
<!--&lt;!&ndash;                <p>waiting...</p>&ndash;&gt;-->
<!--&lt;!&ndash;            {:then { data }}&ndash;&gt;-->
<!--&lt;!&ndash;                {#each data as { name }}&ndash;&gt;-->
<!--&lt;!&ndash;                    <div class="flex">&ndash;&gt;-->
<!--&lt;!&ndash;                        <a href="#" class="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b&ndash;&gt;-->
<!--&lt;!&ndash;                                            border-gray-300 cursor-pointer hover:bg-gray-100 focus:outline-none"&ndash;&gt;-->
<!--&lt;!&ndash;                        on:click={() => {&ndash;&gt;-->
<!--&lt;!&ndash;                            channel = name;&ndash;&gt;-->
<!--&lt;!&ndash;                        }}>&ndash;&gt;-->
<!--&lt;!&ndash;                          <img class="object-cover w-10 h-10 rounded-full"&ndash;&gt;-->
<!--&lt;!&ndash;                               src="https://spaces-cdn.clipsafari.com/c7q6wksk9ojlezcan9cymncfoe70" alt="username" />&ndash;&gt;-->
<!--&lt;!&ndash;                            <div class="w-full pb-2">&ndash;&gt;-->
<!--&lt;!&ndash;                              <div class="flex justify-between">&ndash;&gt;-->
<!--&lt;!&ndash;                                <span class="block ml-2 font-semibold text-gray-600">{name}</span>&ndash;&gt;-->
<!--&lt;!&ndash;                                  <span class="block ml-2 text-sm text-gray-600"></span> &lt;!&ndash;  TODO -> last activity?&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;                              </div>&ndash;&gt;-->
<!--&lt;!&ndash;                                <span class="block ml-2 text-sm text-gray-600"></span> &lt;!&ndash;  TODO -> last message &ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;                            </div>&ndash;&gt;-->
<!--&lt;!&ndash;                        </a>&ndash;&gt;-->
<!--&lt;!&ndash;                    </div>&ndash;&gt;-->
<!--&lt;!&ndash;                {/each}&ndash;&gt;-->
<!--&lt;!&ndash;            {:catch  err}&ndash;&gt;-->
<!--&lt;!&ndash;                <p>{err}</p>&ndash;&gt;-->
<!--&lt;!&ndash;            {/await}&ndash;&gt;-->
<!--&lt;!&ndash;            </li>&ndash;&gt;-->
<!--&lt;!&ndash;        </ul>&ndash;&gt;-->
<!--      </div>-->
<!--      <div class="hidden lg:col-span-2 lg:block">-->
<!--        <div class="w-full">-->
<!--          <div class="relative flex items-center p-3 border-b border-gray-300">-->
<!--            <img-->
<!--              class="object-cover w-10 h-10 rounded-full"-->
<!--              src="https://spaces-cdn.clipsafari.com/c7q6wksk9ojlezcan9cymncfoe70"-->
<!--              alt="username"-->
<!--            />-->
<!--            <span class="block ml-2 font-bold text-gray-600">{channel}</span>-->
<!--            <span-->
<!--              class="absolute w-3 h-3 bg-green-600 rounded-full left-10 top-3"-->
<!--            />-->
<!--          </div>-->
<!--          <div class="relative w-full p-6 overflow-y-auto h-[40rem]">-->
<!--            {#each messagesList as { displayname, message, login: userLogin, id: userId }}-->
<!--              &lt;!&ndash;{#if userId === $id}&ndash;&gt;-->
<!--              &lt;!&ndash;  {/if}&ndash;&gt;-->
<!--              <ul class="space-y-2">-->
<!--                <li class="flex justify-end space-x-3 h-fit p-1 static">-->
<!--                  <div-->
<!--                    class="max-w-xl px-4 py-1 text-gray-700 bg-gray-100 rounded shadow static"-->
<!--                  >-->
<!--                    <span class="block inline-block text-center justify-end"-->
<!--                      >{message}</span-->
<!--                    >-->
<!--                  </div>-->
<!--                  <div class="dropdown dropdown-end">-->
<!--                    <div-->
<!--                      tabindex="0"-->
<!--                      class="btn btn-ghost btn-circle avatar justify-start"-->
<!--                    >-->
<!--                      <ProfilePic-->
<!--                        user={userLogin}-->
<!--                        attributes="h-8 w-8 rounded-full"-->
<!--                      />-->
<!--                    </div>-->
<!--                    <ul-->
<!--                      tabindex="0"-->
<!--                      class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-green-400 rounded-box w-52"-->
<!--                    >-->
<!--                      {#await isbanned(userLogin) then banned}-->
<!--                        {#if banned}-->
<!--                          <li-->
<!--                            class="text-gray-50"-->
<!--                            on:click={() => banUser(userLogin, $login, channel)}-->
<!--                          >-->
<!--                            Ban {displayname}-->
<!--                          </li>-->
<!--                        {:else}-->
<!--                          <li-->
<!--                            class="text-gray-50"-->
<!--                            on:click={() => unbanUser(userLogin, channel)}-->
<!--                          >-->
<!--                            Unban {displayname}-->
<!--                          </li>-->
<!--                        {/if}-->
<!--                      {/await}-->
<!--                      {#await ismuted(userLogin) then muted}-->
<!--                        {#if muted}-->
<!--                          <li-->
<!--                            class="text-gray-50"-->
<!--                            on:click={() =>-->
<!--                              muteUser(userLogin, $login, channel)}-->
<!--                          >-->
<!--                            Mute {displayname}-->
<!--                          </li>-->
<!--                        {:else}-->
<!--                          <li-->
<!--                            class="text-gray-50"-->
<!--                            on:click={() => unmuteUser(userLogin, channel)}-->
<!--                          >-->
<!--                            Unmute {displayname}-->
<!--                          </li>-->
<!--                        {/if}-->
<!--                      {/await}-->
<!--                      {#await is_admin(userLogin) then admin}-->
<!--                        {#if admin}-->
<!--                          <li-->
<!--                            class="text-gray-50"-->
<!--                            on:click={() => addAdmin(userLogin)}-->
<!--                          >-->
<!--                            Add {displayname} as Admin-->
<!--                          </li>-->
<!--                        {:else}-->
<!--                          <li-->
<!--                            class="text-gray-50"-->
<!--                            on:click={() => removeAdmin(userLogin)}-->
<!--                          >-->
<!--                            Remove {displayname} as Admin-->
<!--                          </li>-->
<!--                        {/if}-->
<!--                      {/await}-->
<!--                      <li-->
<!--                        class="text-gray-50"-->
<!--                        on:click={() => banUser(userLogin, $login, channel)}-->
<!--                      >-->
<!--                        Ban {userLogin}-->
<!--                      </li>-->
<!--                      <li-->
<!--                        class="text-gray-50"-->
<!--                        on:click={() => muteUser(userLogin, $login, channel)}-->
<!--                      >-->
<!--                        Mute {userLogin}-->
<!--                      </li>-->
<!--                      <li-->
<!--                        class="text-gray-50"-->
<!--                        on:click={() => unbanUser(userLogin, channel)}-->
<!--                      >-->
<!--                        Unban {userLogin}-->
<!--                      </li>-->
<!--                      <li-->
<!--                        class="text-gray-50"-->
<!--                        on:click={() => unmuteUser(userLogin, channel)}-->
<!--                      >-->
<!--                        View profile-->
<!--                      </li>-->
<!--                      <li-->
<!--                        class="text-gray-50"-->
<!--                        on:click={() => sendpm(userLogin)}-->
<!--                      >-->
<!--                        Sendpm {displayname}-->
<!--                      </li>-->
<!--                      <input-->
<!--                        type="text"-->
<!--                        placeholder="PmMessage"-->
<!--                        class="block w-full py-2 pl-4 mx-3 bg-gray-100 rounded-full outline-none focus:text-gray-700"-->
<!--                        name="pmmessage"-->
<!--                        required-->
<!--                        bind:value={pmmsg}-->
<!--                      />-->
<!--                    </ul>-->
<!--                  </div>-->
<!--                </li>-->
<!--              </ul>-->
<!--            {/each}-->
<!--          </div>-->
<!--          {#if invite}-->
<!--            <div>-->
<!--              {invite.displayname} invited you for a {invite.type-->
<!--                ? "modified"-->
<!--                : "classic"} pong game!-->
<!--              <button-->
<!--                class="btn {invite.id === $id ? 'btn-disabled' : ''}"-->
<!--                on:click={() => {-->
<!--                  if (invite) acceptInvite(socket, channel, invite);-->
<!--                }}-->
<!--              >-->
<!--                Accept-->
<!--              </button>-->
<!--            </div>-->
<!--          {/if}-->
<!--          <div-->
<!--            class="flex items-center justify-between w-full p-3 border-t border-gray-300"-->
<!--          >-->
<!--            <input-->
<!--              type="text"-->
<!--              placeholder="Message"-->
<!--              class="block w-full py-2 pl-4 mx-3 bg-gray-100 rounded-full outline-none focus:text-gray-700"-->
<!--              name="message"-->
<!--              required-->
<!--              bind:value={msg}-->
<!--            />-->
<!--            <button type="submit" on:click={sendmsg}>-->
<!--              <svg-->
<!--                class="w-5 h-5 text-gray-500 origin-center transform rotate-90"-->
<!--                xmlns="http://www.w3.org/2000/svg"-->
<!--                viewBox="0 0 20 20"-->
<!--                fill="currentColor"-->
<!--              >-->
<!--                <path-->
<!--                  d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"-->
<!--                />-->
<!--              </svg>-->
<!--            </button>-->
<!--            <button-->
<!--              type="invite"-->
<!--              class="mr-5"-->
<!--              on:click={() => sendInvite(socket, channel, false)}-->
<!--            >-->
<!--              classic-->
<!--            </button>-->
<!--            <button-->
<!--              type="invite"-->
<!--              on:click={() => sendInvite(socket, channel, false)}-->
<!--            >-->
<!--              modified-->
<!--            </button>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
<!--</body>-->

<div class="drawer">
  <input id="my-drawer" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content">
    <label for="my-drawer" class="btn btn-primary drawer-button">Chat</label>
  </div>
  <div class="drawer-side">
    <label for="my-drawer" class="drawer-overlay"></label>
    <ul class="menu p-4 overflow-y-auto w-96 bg-base-100 text-base-content">
      <div class="relative z-10" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
        <!--
          Background backdrop, show/hide based on slide-over state.

          Entering: "ease-in-out duration-500"
            From: "opacity-0"
            To: "opacity-100"
          Leaving: "ease-in-out duration-500"
            From: "opacity-100"
            To: "opacity-0"
        -->
        <div class="fixed inset-0  transition-opacity"></div>

        <div class="fixed inset-0 overflow-hidden">
          <div class="absolute inset-0 overflow-hidden">
            <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-0">
              <!--
                Slide-over panel, show/hide based on slide-over state.

                Entering: "transform transition ease-in-out duration-500 sm:duration-700"
                  From: "translate-x-full"
                  To: "translate-x-0"
                Leaving: "transform transition ease-in-out duration-500 sm:duration-700"
                  From: "translate-x-0"
                  To: "translate-x-full"
              -->
              <div class="pointer-events-auto relative w-screen max-w-md">
                <div class="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                  <div class="px-4 sm:px-6">
                    <h2 class="text-lg font-medium text-gray-900" id="slide-over-title">{channel}</h2>
                  </div>
                  <div class="relative mt-6 flex-1 px-4 sm:px-6">
                    <!-- Replace with your content -->
                    {#each messagesList as { displayname, message, login: userLogin, id }, ina}
                      <!--            <label tabindex="0" class="" for="unused">{ina + 1}: {displayname}</label>: {message}-->
                      <ul class="space-y-2">
                        <!--              TODO -> when others send message justify start-->
                        <!--              <li class="flex justify-start">-->
                        <!--                <div class="relative max-w-xl px-4 py-2 text-gray-700 rounded shadow">-->
                        <!--                  <span class="block">{message}</span>-->
                        <!--                </div>-->
                        <!--              </li>-->



                        <li class="flex justify-end space-x-3 h-fit p-1 static">
                          <div class="indicator">
                            <p>{userLogin}</p>
                            <div class="max-w-xl px-4 py-1 text-gray-700 bg-gray-100 rounded shadow static">
                              <span class="block inline-block text-center justify-end">{message}</span>
                            </div>
                            <div class="dropdown dropdown-end"></div>
                          </div>
                        </li>
                      </ul>
                    {/each}
                    <!-- /End replace -->
                    <div class="flex items-center justify-between w-full p-3 border-t border-gray-300">
                      <input type="text" placeholder="Message"
                             class="block w-full py-2 pl-4 mx-3 bg-gray-100 rounded-full outline-none focus:text-gray-700"
                             name="message" required
                             bind:value={msg}
                      />
                      <button type="submit" on:click={sendmsg}>
                        <svg class="w-5 h-5 text-gray-500 origin-center transform rotate-90" xmlns="http://www.w3.org/2000/svg"
                             viewBox="0 0 20 20" fill="currentColor">
                          <path
                                  d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ul>
  </div>
</div>