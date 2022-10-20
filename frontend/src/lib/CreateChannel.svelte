<script lang="ts">
  import axios from "axios";
  import Modal from "./Modal.svelte";
  import { createEventDispatcher } from "svelte";
  import { isValidName } from "../utils/chatManagement.js";

  let channelType: number;
  let channelName: string;

  const dispatch = createEventDispatcher();

  const createChannel = async () =>
    axios
      .post(
        `${import.meta.env.VITE_BACKEND_URI}/api/chat/create/${channelName}`,
        {
          password: channelPassword,
          type: channelType,
        },
        {
          withCredentials: true,
        }
      )
      .then(() => dispatch("newChannel"))
      .catch((e) => alert(e.response.data.message));

  // Clear password when type changes
  $: channelPassword = "" && channelType !== 1;
</script>

<label for="create-modal" class="modal-button btn-secondary btn m-2"
  >Create Channel</label
>

<Modal id="create-modal">
  <svelte:fragment slot="content">
    <div class="flex flex-col space-y-4">
      <h3 class="text-lg font-bold">Create channel</h3>
      <div class="form-control gap-4">
        <select bind:value={channelType} class="select select-bordered">
          <option disabled selected>Choose channel type</option>
          <option value={0}>Public</option>
          <option value={1}>Private</option>
          <option value={2}>Invite only</option>
        </select>
        <label class="input-group">
          <span>Name</span>
          <input
            bind:value={channelName}
            type="text"
            placeholder=""
            class="input input-bordered flex-auto"
          />
        </label>

        {#if channelType === 1}
          <label class="input-group">
            <span>Password</span>
            <input
              bind:value={channelPassword}
              type="password"
              placeholder=""
              class="input input-bordered flex-auto"
            />
          </label>
        {/if}
      </div>
      <div class="modal-action">
        <label
          for="create-modal"
          class="btn btn-active btn-primary {isValidName(channelName) &&
          !isNaN(channelType)
            ? ''
            : 'btn-disabled'}"
          on:click={createChannel}
          on:keypress={createChannel}>Create</label
        >
      </div>
    </div>
  </svelte:fragment>
</Modal>
