<script lang="ts">
  import { io } from "socket.io-client";
  import { onDestroy, onMount } from "svelte";

  export let channel = "";

  let msg: string;
  let messagesList: Array<string> = [];

  const socket = io(import.meta.env.VITE_BACKEND_URI, {
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("connected");
  });

  onMount(() => socket.emit("joinRoom", { name: channel }));

  onDestroy(() => socket.emit("leaveRoom", { name: channel }));

  socket.on("newMessage", (event) => {
    messagesList.push(event);
    messagesList = messagesList;
    msg = "";
  });

  const sendmsg = () => socket.emit("sendMessage", msg);
</script>

<h1>test</h1>
<br /><br />
{#each messagesList as item, ina}
  <li>{ina + 1}: {item}</li>
{/each}
<br /><br />
<h1>Hello world</h1>
<br /><br />
<input bind:value={msg} />
<button on:click={sendmsg}> send message </button>
