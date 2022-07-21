<script lang="ts">
  import axios from "axios";

  //TODO Get the userID instead of its name:
  const banUser = (channelName: string, userName: string) =>
    axios.post(
      `${
        import.meta.env.VITE_BACKEND_URI
      }/api/chat/ban/${channelName}/${userName}`,
      {
        withCredentials: true,
      }
    );

  let userName: string;
  let channelName: string;
</script>

<label for="username" class="modal-button btn">Ban user</label>

<input type="checkbox" id="username" class="modal-toggle" />
<label for="username" class="modal cursor-pointer">
  <label class="modal-box relative" for="username">
    <label for="username" class="btn btn-sm btn-circle absolute right-2 top-2"
      >✕</label
    >
    <div class="flex flex-col space-y-4">
      <h3 class="text-lg font-bold">Ban user</h3>
      <div class="form-control">
        <label class="input-group">
          <span>Name</span>
          <input
            bind:value={userName}
            type="text"
            placeholder=""
            class="input input-bordered flex-auto"
          />
        </label>
      </div>
      <div class="form-control">
        <label class="input-group">
          <span>channel</span>
          <input
            bind:value={channelName}
            type="text"
            placeholder=""
            class="input input-bordered flex-auto"
          />
        </label>
      </div>
      <div class="modal-action">
        <label
          for="username"
          class="btn btn-active btn-primary"
          on:click={() => banUser(channelName, userName)}
          >Create
        </label>
      </div>
    </div>
  </label>
</label>
