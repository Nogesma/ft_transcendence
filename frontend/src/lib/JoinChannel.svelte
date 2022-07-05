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

<<<<<<< HEAD
<label for="join-modal" class="modal-button btn">Join Channel</label>

<input type="checkbox" id="join-modal" class="modal-toggle" />
<label for="join-modal" class="modal cursor-pointer">
  <label class="modal-box relative">
    <label for="join-modal" class="btn btn-sm btn-circle absolute right-2 top-2"
      >✕</label
    >
    <div class="flex flex-col">
      <h3 class="justify-around text-lg font-bold pb-4">Join channel</h3>
      <select bind:value={channelType} class="select select-bordered">
        <option disabled selected>Choose channel type</option>
        <option>Public</option>
        <option>Private</option>
      </select>

      {#if channelType === "Public"}
        {#await getPublicChannels()}
          <p>waiting...</p>
        {:then { data }}
          <div
            class="flex flex-row flex-wrap justify-around content-evenly mt-4 flex-auto space-x-4"
          >
            {#each data as { name, id }}
              <label
                for="join-modal"
                class="btn flex-auto"
                on:click={() => {
                  channelName = name;
                  channelId = id;
                  joinChannel();
                }}>{id}:{name}</label
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
=======
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
>>>>>>> chat/rooms
  </label>
</label>
