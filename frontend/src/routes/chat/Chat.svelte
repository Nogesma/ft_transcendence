<script lang="ts">
  import { io } from "socket.io-client";
  import chatIcon from "../../../public/chatIcon.png"
  import closeIcon from "../../../public/closeIcon.png"
  import sendIcon from "../../../public/sendIcon.png"
  import {quintOut} from "svelte/easing";

  let msg: string;
  let messagesList: Array<string> = [];

  const socket = io("http://localhost:3000", { withCredentials: true });

  socket.on("connect", () => {
    console.log("connected");
  });

  socket.on("newMessage", (event) => {
    messagesList.push(event);
    messagesList = messagesList;
    msg = "";
  });

  const sendmsg = () => socket.emit("sendMessage", msg);

  // // Chat component
  // let chatIsOpen: boolean;
  // chatIsOpen = false;
  // const toggleChat = () => (chatIsOpen = !chatIsOpen);

</script>

<!--<div class="main">-->
  <!--{#each messagesList as item, ina}-->
  <!--  <li>{ina + 1}: {item}</li>-->
  <!--{/each}-->
<!--  <br /><br />-->
<!--  <h1>Hello world</h1>-->
<!--  <br /><br />-->
<!--  <input bind:value={msg} />-->
<!--  <button on:click={sendmsg}> send message </button>-->
<!--</div>-->

<div class="drawer drawer-end">
  <input id="my-drawer-4" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content">
    <label for="my-drawer-4" class="drawer-button btn btn-primary">Message</label>
  </div>
  <div class="drawer-side">
    <label for="my-drawer-4" class="drawer-overlay"></label>
    <div class="menu p-4 overflow-y-auto w-80 bg-base-100 text-base-content">
      <ul class="">
        <!-- Sidebar content here -->
        {#each messagesList as item, ina}
          <li>{ina + 1}: {item}</li>
        {/each}
      </ul>
      <input bind:value={msg} />
      <button on:click={sendmsg}> send message </button>
    </div>
  </div>
</div>