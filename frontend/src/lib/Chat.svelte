<style type="text/css">
  .context-menu {
    position: absolute;
    text-align: center;
    background: lightgray;
    border: 1px solid black;
  }

  .context-menu ul {
    padding: 0px;
    margin: 0px;
    min-width: 150px;
    list-style: none;
  }

  .context-menu ul li {
    padding-bottom: 7px;
    padding-top: 7px;
    border: 1px solid black;
  }


  .context-menu ul li:hover {
    background: darkgray;
  }
</style>

<div id="Adminmenu" class="context-menu"
     style="display: none">
  <ul>
    <li><p id="ban" class="button" on:click={banppl} >Ban</p></li>
    <li><p id="mute" class="button" on:click={muteppl}>Mute</p></li>
  </ul>
</div>

<script lang="ts">
  import { io } from "socket.io-client";
  import { onMount } from "svelte";
  import axios from "axios";

  export let channel = "";

  let msg: string;
  let messagesList: Array<string> = [];
  let name: string;

  const muteppl = () =>
  {
    if (name === localStorage.getItem('displayname'))
      return ;
  }

  const banppl = () => {

    // TODO prevent banning yourself
    if (name === localStorage.getItem('displayname'))
      return ;
      axios.post(
             `${import.meta.env.VITE_BACKEND_URI}/api/chat/ban/${channel}/${name}`,
              {
               withCredentials: true,
              },
      );
  }
  const hideMenu = () => {
    document.getElementById("Adminmenu").style.display = "none"
  }

  const rightclick = (pos) => {
    let str = document.getElementById('msg').textContent;
    str = str.substring(str.search(" ") + 1)
    name = str.substring(0,str.search(":"));
    console.log(name)
    pos.preventDefault();

    if (document.getElementById("Adminmenu").style.display == "block")
      hideMenu();
    else {
      let menu = document.getElementById("Adminmenu")

      menu.style.display = 'block';
      menu.style.left = pos.pageX + "px";
      menu.style.top = pos.pageY + "px";
    }
  }
  document.oncontextmenu = hideMenu;

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
    messagesList.push(`${localStorage.getItem("displayname")}: ${msg}`);
    messagesList = messagesList;
    msg = "";
  };
</script>

<h1>{channel}</h1>
<br /><br />
{#each messagesList as item, ina}
  <div class="myElement" oncontextmenu="return false;">
  <li id="msg" on:auxclick|preventDefault={rightclick}>{ina + 1}: {item}</li>
  </div>
{/each}
<form class="pt-40" on:submit|preventDefault={() => (msg = "")}>
  <label for="send">
    <p>
      <input bind:value={msg} />
    </p>
  </label>
  <button id="send" on:click={sendmsg}> send message </button>
</form>
