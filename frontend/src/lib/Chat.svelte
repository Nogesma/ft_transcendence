<script lang="ts">
  import { io } from "socket.io-client";
  import { onMount } from "svelte";
  import axios from "axios";
  import Modal from "./Modal.svelte";
  import { displayname, login, id } from "../stores/settings";
  import ProfilePic from "./ProfilePic.svelte";
  import { push } from "svelte-spa-router";

  export let channel = "";

  let msg: string;
  let messagesList: Array<{
    message: string;
    login: string;
    displayname: string;
  }> = [];
  const muteppl = (name) => {
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
  const unmuteppl = (name) => {
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
  const unbanppl = (name) => {
    axios.post(
      `${import.meta.env.VITE_BACKEND_URI}/api/chat/unban/${name}`,
      {
        name: channel,
      },
      {
        withCredentials: true,
      }
    );
  };
  const banppl = (name) => {
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

  const add_admin = (name) => {
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

  const socket = io(import.meta.env.VITE_BACKEND_URI, {
    withCredentials: true,
  });
  onMount(() => socket.emit("joinRoom", { channel }));

  socket.on("newMessage", (event) => {
    messagesList.push(event);
    messagesList = messagesList;
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

  let currentUser = 0;
</script>

<h1>{channel}</h1>
<br /><br />
{#each messagesList as { displayname, message, login: userLogin, id }, ina}
  <div class="dropdown">
    <label tabindex="0" class="" on:click={() => (currentUser = ina)}
      >{ina + 1}: {displayname}</label
    >: {message}
    <div
      tabindex="0"
      class="dropdown-content card card-side bg-base-100 shadow-xl"
    >
      <figure>
        <ProfilePic user={userLogin} attributes="max-h-20" />
      </figure>
      <div class="card-body">
        <div class="card-actions justify-end">
          <div class="dropdown">
            <label tabindex="0" class="btn m-1">Click</label>
            <ul
              tabindex="0"
              class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <button
                  class="btn btn-primary"
                  id="ban"
                  on:click={() => banppl(userLogin)}>Ban</button
                >
              </li>
              <li>
                <button
                  class="btn btn-secondary"
                  id="unban"
                  on:click={() => unbanppl(userLogin)}>UnBan</button
                >
              </li>
              <li>
                <button
                  class="btn btn-accent"
                  id="mute"
                  on:click={() => muteppl(userLogin)}>Mute</button
                >
              </li>
              <li>
                <button
                  class="btn btn-accent"
                  id="unmute"
                  on:click={() => unmuteppl(userLogin)}>UnMute</button
                >
              </li>
              <li>
                <button
                  class="btn btn-accent"
                  id="add_admin"
                  on:click={() => add_admin(userLogin)}>Add Admin</button
                >
              </li>
            </ul>
            ß
          </div>
        </div>
        <h2 class="card-title">
          <a href="#/users/{id}">{displayname}</a>
        </h2>
        <h2 class="card-title">
          <p>Click the button to watch on Jetflix app.</p>
          <div class="card-actions justify-end">
            <button class="btn btn-primary">Watch</button>
          </div>
        </h2>
      </div>
    </div>
  </div>
{/each}
<form class="pt-40" on:submit|preventDefault={() => (msg = "")}>
  <label class="input-group">
    <span>Code</span>
    <input class="input input-bordered" bind:value={msg} />
  </label>
  <button on:click={sendmsg}> send message </button>
</form>
