<script lang="ts">
  import axios from "axios";

  const getChannels = () =>
    axios.get(`${import.meta.env.VITE_BACKEND_URI}/api/chat/channels`, {
      withCredentials: true,
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
      .catch();
</script>

<label for="delete-modal" class="modal-button btn">Delete Channel</label>

<input type="checkbox" id="delete-modal" class="modal-toggle" />
<label for="delete-modal" class="modal cursor-pointer">
  <label class="modal-box relative" for="delete-modal">
    <label
      for="delete-modal"
      class="btn btn-sm btn-circle absolute right-2 top-2">✕</label
    >
    <div class="flex flex-col">
      <h3 class="text-lg font-bold pb-4">Delete channel</h3>

      {#await getChannels()}
        <p>waiting...</p>
      {:then { data }}
        <div class="flex flex-row flex-wrap mt-4 -ml-4 -mb-4 flex-auto">
          {#each data as { name }}
            <label
              for="delete-modal"
              class="btn flex-auto mb-4 ml-4"
              on:click={() => deleteChannel(name)}>{name}</label
            >
          {/each}
        </div>
      {:catch err}
        {err}
      {/await}
    </div>
  </label>
</label>
