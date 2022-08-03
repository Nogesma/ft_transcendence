<script lang="ts">
  import { onMount } from "svelte";
  import { chatSocket } from "../utils/socket";
  import axios from "axios";
  import { displayname, login, id } from "../stores/settings";
  import ProfilePic from "./ProfilePic.svelte";
  import {isEmpty} from "ramda";
  import Chat from "./Chat.svelte";

  export let channel = "";

  // List chat
  let channelListName ="";
  let hasChat = false;
  if (!isEmpty(channel)) hasChat = true;
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
  const muteUser = (name: string) => {
    if (name === $login) {
      alert("You cannot mute yourself");
      return;
    }
    axios.post(
      `${import.meta.env.VITE_BACKEND_URI}/api/chat/mute/${name}`,
      {
        name: channel,
        expires: new Date(),
      },
      {
        withCredentials: true,
      }
    );
  };
  const sendpm = (name: string) => {
    let str = $login;
    if (str === name) {
      alert("you cannot send a pm to yourself");
      return;
    }
    socket.emit("sendpm", { name, str });
  };
  const unmuteUser = (name: string) => {
    axios.post(
      `${import.meta.env.VITE_BACKEND_URI}/api/chat/unmute/${name}`,
      {
        name: channel,
      },
      {
        withCredentials: true,
      }
    );
  };
  const unbanUser = (name: string) => {
    axios.post(
      `${import.meta.env.VITE_BACKEND_URI}/api/chat/UnBan/${name}`,
      {
        name: channel,
      },
      {
        withCredentials: true,
      }
    );
  };
  const banUser = (name: string) => {
    if (name === $login) {
      alert("You cannot ban yourself");
      return;
    }
    axios.post(
      `${import.meta.env.VITE_BACKEND_URI}/api/chat/ban/${name}`,
      {
        name: channel,
        expires: new Date(),
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

  const socket = chatSocket();

  onMount(() => socket.emit("joinRoom", { channel }));

  socket.on("newMessage", (event) => {
    messagesList.push(event);
    messagesList = messagesList;
  });
  socket.on("pm", (event) => {
    console.log("test");
    alert(event);
  });
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
</script>

<!--<h1>{channel}</h1>-->
<br /><br />

<!--{#each messagesList as { displayname, message, login: userLogin, id }, ina}-->
<!--  <div class="dropdown p-2 bg-base-100 rounded-box">-->
<!--    <label tabindex="0" class="" for="unused">{ina + 1}: {displayname}</label>: {message}-->
<!--    <div-->
<!--      tabindex="0"-->
<!--      class="dropdown-content card card-side bg-base-100 shadow-xl max-h-fit max-w-fit"-->
<!--    >-->
<!--      <div class="dropdown">-->
<!--      <div class="card-body max-h-fit bg-neutral-focus">-->
<!--        <label for="unused" tabindex="0" class="btn m-1">-->
<!--          <div tabindex="0" class="btn btn-ghost btn-circle avatar">-->
<!--              <ProfilePic user={userLogin} attributes="h-12 w-12 rounded-full" />-->
<!--          </div>-->
<!--        </label>-->
<!--        <div class="card-actions justify-end">-->
<!--&lt;!&ndash;          <div class="dropdown">&ndash;&gt;-->
<!--            <ul-->
<!--              tabindex="0"-->
<!--              class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 max-h-full"-->
<!--            >-->
<!--              <li>-->
<!--                <button-->
<!--                  class="btn btn-primary max-h-fit"-->
<!--                  id="ban"-->
<!--                  on:click={() => banppl(userLogin)}>Ban</button-->
<!--                >-->
<!--              </li>-->
<!--              <li>-->
<!--                <button-->
<!--                  class="btn btn-secondary"-->
<!--                  id="unban"-->
<!--                  on:click={() => unbanppl(userLogin)}>UnBan</button-->
<!--                >-->
<!--              </li>-->
<!--              <li>-->
<!--                <button-->
<!--                  class="btn btn-accent max-h-fit"-->
<!--                  id="mute"-->
<!--                  on:click={() => muteppl(userLogin)}>Mute</button-->
<!--                >-->
<!--              </li>-->
<!--              <li>-->
<!--                <button-->
<!--                  class="btn btn-accent"-->
<!--                  id="unmute"-->
<!--                  on:click={() => unmuteppl(userLogin)}>UnMute</button-->
<!--                >-->
<!--              </li>-->
<!--              <li>-->
<!--                <button-->
<!--                  class="btn btn-accent"-->
<!--                  id="add_admin"-->
<!--                  on:click={() => add_admin(userLogin)}>Add Admin</button-->
<!--                >-->
<!--              </li>-->
<!--            </ul>-->
<!--            ß-->
<!--          </div>-->
<!--        </div>-->
<!--&lt;!&ndash;        <h2 class="card-title">&ndash;&gt;-->
<!--&lt;!&ndash;          <a href="#/users/{id}">{displayname}</a>&ndash;&gt;-->
<!--&lt;!&ndash;        </h2>&ndash;&gt;-->
<!--        <h2 class="card-title">-->
<!--          <p>Click the button to watch on Jetflix app.</p>-->
<!--          <div class="card-actions justify-end">-->
<!--            <button on:click={() => sendpm(userLogin)} class="btn btn-primary"-->
<!--              >send pm to {displayname}</button-->
<!--            >-->
<!--          </div>-->
<!--        </h2>-->
<!--      </div>-->
<!--    </div>-->
<!--  </div>-->
<!--{/each}-->


<body>
  <div class="container mx-auto">
    <div class="min-w-full border rounded lg:grid lg:grid-cols-3">
      <div class="border-r border-gray-300 lg:col-span-1">
        <div class="mx-3 my-3">
          <div class="relative text-gray600">
            <span class="absolute inset-y-0 left-0 flex items-center pl-2">
               <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    viewBox="0 0 24 24" class="w-6 h-6 text-gray-300">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
            </span>
            <input type="search" class="block w-full py-2 pl-10 bg-gray-100 rounded outline-none" name="search"
                   placeholder="Search" required />
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
                        <a href="#" class="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b
                                            border-gray-300 cursor-pointer hover:bg-gray-100 focus:outline-none"
                        on:click={() => {
                            channel = name;
                        }}>
                          <img class="object-cover w-10 h-10 rounded-full"
                               src="https://spaces-cdn.clipsafari.com/c7q6wksk9ojlezcan9cymncfoe70" alt="username" />
                            <div class="w-full pb-2">
                              <div class="flex justify-between">
                                <span class="block ml-2 font-semibold text-gray-600">{name}</span>
                                  <span class="block ml-2 text-sm text-gray-600"></span> <!--  TODO -> last activity?-->
                              </div>
                                <span class="block ml-2 text-sm text-gray-600"></span> <!--  TODO -> last message -->
                            </div>
                        </a>
                    </div>
                {/each}
            {:catch  err}
                <p>{err}</p>
            {/await}
            </li>
        </ul>
      </div>
        <div class="hidden lg:col-span-2 lg:block">
            <div class="w-full">
                <div class="relative flex items-center p-3 border-b border-gray-300">
                    <img class="object-cover w-10 h-10 rounded-full"
                         src="https://spaces-cdn.clipsafari.com/c7q6wksk9ojlezcan9cymncfoe70" alt="username" />
                    <span class="block ml-2 font-bold text-gray-600">{channel}</span>
                    <span class="absolute w-3 h-3 bg-green-600 rounded-full left-10 top-3"></span>
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
                  <div class="max-w-xl px-4 py-1 text-gray-700 bg-gray-100 rounded shadow static">
                      <span class="block inline-block text-center justify-end">{message}</span>
                  </div>
                  <div class="dropdown dropdown-end">
                      <div tabindex="0" class="btn btn-ghost btn-circle avatar justify-start">
                        <ProfilePic user={userLogin} attributes="h-8 w-8 rounded-full" />
                      </div>
                      <ul tabindex="0"
                          class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-green-400 rounded-box w-52"
                      >
                          <li class="text-gray-50">list</li>
<!--                          <li><button on:click={sendmsg}>Logout</button></li>-->
                      </ul>
                  </div>
              </li>
            </ul>
            {/each}
          </div>
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
</body>
