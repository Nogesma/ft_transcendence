<script lang="ts">
  import axios from "axios";
  import Modal from "./Modal.svelte";

  let channelPublic = true;
  let channelName: string;

  const createChannel = async () => {
    await axios
      .post(
        `${import.meta.env.VITE_BACKEND_URI}/api/chat/create/${channelName}`,
        {
          password: channelPassword,
          public: channelPublic,
        },
        {
          withCredentials: true,
        }
      )
      .then(({ data }) => console.log(data))
      .catch(console.error);
    //todo: we should not reload to not lose user data
    // window.location.reload();
  };

  // Clear password when type changes
  $: channelPassword = "" && channelPublic;
</script>

<label for="create-modal" class="modal-button btn-secondary btn m-2">Create Channel</label>

<Modal id="create-modal">
  <svelte:fragment slot="content">
    <div class="flex flex-col space-y-4">
      <h3 class="text-lg font-bold">Create channel</h3>
      <div class="form-control">
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
        <label class="label cursor-pointer">
          <span class="label-text">Public channel</span>
          <input
            type="checkbox"
            bind:checked={channelPublic}
            class="toggle toggle-primary"
          />
        </label>
      </div>
      {#if !channelPublic}
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
      {/if}
      <div class="modal-action">
        <label
          for="create-modal"
          class="btn btn-active btn-primary"
          on:click={createChannel}
          on:keypress={createChannel}>Create</label
        >
      </div>
    </div>
  </svelte:fragment>
</Modal>
