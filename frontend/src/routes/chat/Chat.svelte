<script lang="ts">
  import { io } from "socket.io-client";
  import chatIcon from "../../../public/chatIcon.png";
  import sendIcon from "../../../public/sendIcon.png";
  import closeIcon from "../../../public/closeIcon.png";
  import ProfilePic from "../../lib/ProfilePic.svelte";

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
</script>

<label for="my-modal" class="flex">
  <img class="" width="55" height="55" src={chatIcon} alt="chatIcon" />
</label>

<!-- Put this part before </body> tag -->
<input type="checkbox" id="my-modal" class="modal-toggle" />
<div class="modal">
  <div class="modal-box">
    <div class="messages-content ">
      {#each messagesList as item}
        <span
          class="flex m-1 p-2 bg-gray-800 text-gray-200 text-xl font-normal rounded-sm px-5 items-end"
          style="font-size: 15px;"
        >
          <span class="m-1">
            <ProfilePic height="h-6" width="w-6" />
          </span>
          <span class="m-1">
            : {item}
          </span>
        </span>
      {/each}
    </div>
    <div class="flex flex-auto justify-between p-1">
      <div class="relative m-1">
        <input
          bind:value={msg}
          type="text"
          class="rounded-full pl-6 pr-12 py-2 focus:outline-none
                                              h-auto placeholder-gray-100 bg-gray-900 text-white"
          style="font-size: 11px;width: 250px;"
          placeholder="Type a message..."
          id="typemsg"
        />
      </div>
      <div
        class="w-8 h-8 rounded-full bg-blue-300 text-center items-center flex justify-center m-1"
      >
        <button
          class="w-8 h-8 rounded-full text-center items-center flex justify-center focus:outline-none
                        hover:bg-gray-900 hover:text-white"
          on:click={sendmsg}
        >
          <img src={sendIcon} alt="send" />
        </button>
      </div>
    </div>
    <div class="modal-action">
      <label for="my-modal" class="">
        <img class="" width="55" height="55" src={closeIcon} alt="closeIcon" />
      </label>
    </div>
  </div>
</div>
