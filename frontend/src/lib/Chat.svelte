<div class="btn-group btn-group-vertical context-menu max-w-xs" id="Adminmenu" style="display: none" >
  <button class="btn btn-primary" id="ban" on:click={banppl} >Ban</button>
  <button class="btn btn-secondary" id="unban" on:click={unbanppl} >UnBan</button>
  <button class="btn btn-accent" id="mute" on:click={muteppl}>Mute</button>
  <button class="btn btn-accent" id="unmute" on:click={unmuteppl}>UnMute</button>
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
    if (name === localStorage.getItem('login'))
    {
      alert("You cannot mute yourself")
      return;
    }
    axios.post(`${import.meta.env.VITE_BACKEND_URI}/api/chat/mute/${name}`,
            {
              name: channel,
              expires: new Date(),
            },
            {
              withCredentials: true,
            });
  }
  const unmuteppl = () => {
    axios.post(`${import.meta.env.VITE_BACKEND_URI}/api/chat/unmute/${name}`,
            {
              name: channel,
            },
            {
              withCredentials: true,
            },
    );
  }
  const unbanppl = () => {
    axios.post(`${import.meta.env.VITE_BACKEND_URI}/api/chat/unban/${name}`,
            {
              name: channel,
            },
            {
              withCredentials:  true,
            },
    );
  }
  const banppl = () => {
    if (name === localStorage.getItem('login'))
    {
      alert("You cannot ban yourself")
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
              },
      );
  }
  const hideMenu = () => {
    document.getElementById("Adminmenu").style.display = "none"
  }

  const rightclick = (pos, idx) => {
    let str = messagesList[idx];
    name = str.substring(0,str.search(":"));
    if (name === `Me`)
        name = localStorage.getItem('login')
    pos.preventDefault();

    if (document.getElementById("Adminmenu").style.display == "block")
      hideMenu();
    else {
      let menu = document.getElementById("Adminmenu")

      menu.style.display = 'flex';
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
    event = event.substring(event.search(":") + 2);
    messagesList.push(event);
    messagesList = messagesList;
  });

  const sendmsg = () => {
    socket.emit("sendMessage", { channel, msg });
    messagesList.push(`Me: ${msg}`);
    messagesList = messagesList;
    msg = "";
  };
</script>

<svelte:body on:click={hideMenu}/>
<h1>{channel}</h1>
<br /><br />
{#each messagesList as item, ina}
  <div class="myElement" oncontextmenu="return false;">
  <li id="msg" on:auxclick|preventDefault={(e) => rightclick(e, ina)}>{ina + 1}: {item}</li>
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
