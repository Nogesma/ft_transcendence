<script lang="ts">
  import axios from "axios";
  import Modal from "./Modal.svelte";
  import { createEventDispatcher } from "svelte";

  export let channels: { name: string }[];

  const dispatch = createEventDispatcher();

  const leaveChannel = (chan: string) =>
    axios
      .post(
        `${import.meta.env.VITE_BACKEND_URI}/api/chat/leave/${chan}`,
        {},
        {
          withCredentials: true,
        }
      )
      .then(() => dispatch("newChannel"))
      .catch((e) => {
        alert(e.response.data.message);
      });
</script>

<label for="leave-modal" class="modal-button btn m-2">Leave channel</label>

<Modal id="leave-modal">
  <svelte:fragment slot="content">
    <div class="flex flex-col">
      <h3 class="text-lg font-bold pb-4">Leave channel</h3>

      <div class="flex flex-row flex-wrap mt-4 -ml-4 -mb-4 flex-auto">
        {#each channels as { name }}
          <label
            for="leave-modal"
            class="btn flex-auto mb-4 ml-4"
            on:click={() => leaveChannel(name)}
            on:keypress={() => leaveChannel(name)}>{name}</label
          >
        {/each}
      </div>
    </div>
  </svelte:fragment>
</Modal>
