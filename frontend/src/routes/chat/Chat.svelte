<script lang="ts">
  import { io } from "socket.io-client";

  let msg: string;
  let messagesList: Array<string> = [];

  const socket = io("http://localhost:3000");

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
