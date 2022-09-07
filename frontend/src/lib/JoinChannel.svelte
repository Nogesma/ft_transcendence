<script lang="ts">
  import axios from "axios";
  import Modal from "./Modal.svelte";

  const getPublicChannels = () =>
    axios
      .get(`${import.meta.env.VITE_BACKEND_URI}/api/chat/public`, {
        withCredentials: true,
      })
      .catch((e) => {
        console.error(e);
        return { data: [] };
      });

  export const joinChannel = () =>
    axios
      .post(
        `${import.meta.env.VITE_BACKEND_URI}/api/chat/join/${channelName}`,
        {
          password: channelPassword,
          public: channelType == "Public",
        },
        {
          withCredentials: true,
        }
      )
      .catch(console.error);

  let channelType: string;
  let channelName: string;

  // Clear password when type changes
  $: channelPassword = "" && channelType;
</script>

<label for="join-modal" class="modal-button btn">Join Channel</label>

<Modal id="join-modal">
  <svelte:fragment slot="content">
    <div class="flex flex-col">
      <h3 class="text-lg font-bold pb-4">Join channel</h3>
      <select bind:value={channelType} class="select select-bordered">
        <option disabled selected>Choose channel type</option>
        <option>Public</option>
        <option>Private</option>
      </select>

      {#if channelType === "Public"}
        {#await getPublicChannels() then { data }}
          <div class="flex flex-row flex-wrap mt-4 -ml-4 -mb-4 flex-auto">
            {#each data as { name }}
              <label
                for="join-modal"
                class="btn flex-auto mb-4 ml-4"
                on:click={() => {
                  channelName = name;
                  joinChannel();
                }}>{name}</label
              >
            {/each}
          </div>
        {:catch err}
          {err}
        {/await}
      {:else if channelType === "Private"}
        <div class="flex-col flex space-y-4">
          <div class="form-control mt-4">
            <label class="input-group">
              <span>Name</span>
              <input
                bind:value={channelName}
                type="text"
                placeholder=""
                class="input input-bordered flex-auto"
              />
            </label>
          </div>
          <div class="form-control">
            <label class="input-group">
              <span>Password</span>
              <input
                bind:value={channelPassword}
                type="password"
                placeholder=""
                class="input input-bordered flex-auto"
              />
            </label>
          </div>
          <div class="modal-action">
            <label
              for="join-modal"
              class="btn btn-active btn-primary"
              on:click={joinChannel}>Join</label
            >
          </div>
        </div>
      {/if}
    </div>
  </svelte:fragment>
</Modal>
