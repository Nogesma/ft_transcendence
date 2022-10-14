<script lang="ts">
  import axios from "axios";
  import Modal from "./Modal.svelte";

  const getChannels = () =>
    axios
      .get(`${import.meta.env.VITE_BACKEND_URI}/api/chat/channels`, {
        withCredentials: true,
      })
      .catch((e) => {
        console.error(e);
        return { data: [] };
      });

  const deleteChannel = (channelName: string) =>
    axios
      .post(
        `${import.meta.env.VITE_BACKEND_URI}/api/chat/delete/${channelName}`,
        {},
        {
          withCredentials: true,
        }
      )
      .then(({ data }) => console.log(data))
      .catch(console.error);
</script>

<label for="delete-modal" class="modal-button btn">Delete Channel</label>

<Modal id="delete-modal">
  <svelte:fragment slot="content">
    <div class="flex flex-col">
      <h3 class="text-lg font-bold pb-4">Delete channel</h3>

      {#await getChannels() then { data }}
        <div class="flex flex-row flex-wrap mt-4 -ml-4 -mb-4 flex-auto">
          {#each data as { name }}
            <label
              for="delete-modal"
              class="btn flex-auto mb-4 ml-4"
              on:click={() => deleteChannel(name)}
              on:keypress={() => deleteChannel(name)}>{name}</label
            >
          {/each}
        </div>
      {:catch err}
        {err}
      {/await}
    </div>
  </svelte:fragment>
</Modal>
