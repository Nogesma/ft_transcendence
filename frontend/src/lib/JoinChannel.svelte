<script lang="ts">
  import axios from "axios";

  const getPublicChannels = () =>
    axios.get(`${import.meta.env.VITE_BACKEND_URI}/api/chat/public`, {
      withCredentials: true,
    });
  // .catch(() => push("/auth/login"))

  const joinChannel = () =>
    axios.post(
      `${import.meta.env.VITE_BACKEND_URI}/api/chat/join/${channelName}`,
      {
        password: channelPassword,
        public: channelType == "Public",
        id: channelId,
      },
      {
        withCredentials: true,
      }
    );
  let channelType: string;
  let channelId = -1;
  let channelName: string;

  // Clear password when type changes
  $: channelPassword = "" && channelType;
</script>

<!-- The button to open modal -->
<label for="join-modal" class="modal-button btn">Join Channel</label>

<!-- Put this part before </body> tag -->
<input type="checkbox" id="join-modal" class="modal-toggle" />
<label for="join-modal" class="modal cursor-pointer">
  <label class="modal-box relative" for="">
    <label for="join-modal" class="btn btn-sm btn-circle absolute right-2 top-2"
      >✕</label
    >
    <h3 class="text-lg font-bold">Join channel</h3>
    <select
      bind:value={channelType}
      class="select select-bordered w-full max-w-xs"
    >
      <option disabled selected>Choose channel type</option>
      <option>Public</option>
      <option>Private</option>
    </select>

    {#if channelType === "Public"}
      {#await getPublicChannels()}
        <p>waiting...</p>
      {:then { data }}
        {#each data as { name, id }}
          <label
            for="join-modal"
            class="btn btn-active"
            on:click={() => {
              channelName = name;
              channelId = id;
              joinChannel();
            }}>{id}:{name}</label
          >
        {/each}
      {:catch err}
        {err}
      {/await}
    {:else if channelType === "Private"}
      <div class="form-control">
        <label class="input-group">
          <span>Name</span>
          <input
            bind:value={channelName}
            type="text"
            placeholder=""
            class="input input-bordered"
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
            class="input input-bordered"
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
    {/if}
  </label>
</label>
