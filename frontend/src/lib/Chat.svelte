<script lang="ts">
  import { io } from "socket.io-client";
  import { onDestroy, onMount } from "svelte";
  export let channel = { name: "", id: -1 };
  let msg: string;
  let messagesList: Array<string> = [];

  const socket = io(import.meta.env.VITE_BACKEND_URI, {
    withCredentials: true,
  });
  onMount(() => socket.emit("joinRoom", { id: channel.id }));

  socket.on("disconnect", () => {
    socket.emit("leaveRoom", { id: channel.id });
  });
  onDestroy(() => socket.emit("leaveRoom", { id: channel.id }));

  socket.on("connect", () => {
    console.log("connected");
  });
  socket.on("newMessage", (event) => {
    messagesList.push(event);
    messagesList = messagesList;
    msg = "";
  });
  const sendmsg = () => socket.emit("sendMessage", msg);
</script>

<br /><br />
{#each messagesList as item, ina}
  <li>{ina + 1}: {item}</li>
{/each}
<form class="pt-40" on:submit|preventDefault={() => (msg = "")}>
  <label for="send">
    <p>
      <input bind:value={msg} />
    </p>
  </label>
  <button id="send" on:click={sendmsg}> send message </button>
</form>
