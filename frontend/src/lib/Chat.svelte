<script lang="ts">
  import { onMount } from "svelte";
  import { chatSocket } from "../utils/socket";
  export let channel = "";
  let msg: string;
  let messagesList: Array<string> = [];

  const socket = chatSocket();

  onMount(() => socket.emit("joinRoom", { channel }));

  socket.on("connect", () => {
    console.log("connected");
  });

  socket.on("newMessage", (event) => {
    messagesList.push(event);
    messagesList = messagesList;
  });

  const sendmsg = () => {
    socket.emit("sendMessage", { channel, msg });
    messagesList.push(msg);
    messagesList = messagesList;
    msg = "";
  };
</script>

<h1>{channel}</h1>
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
