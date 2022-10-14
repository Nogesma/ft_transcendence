<script lang="ts">
  import { getUserInfo } from "../utils/info.js";
  import ProfilePic from "../lib/ProfilePic.svelte";
  import { privateMessages, pmSocket, pendingPM } from "../stores/settings.js";
  import Modal from "../lib/Modal.svelte";
  import { getFriendList } from "../utils/friend.js";
  import axios from "axios";
  import { isEmpty } from "ramda";
  import Promise from "bluebird";

  import { params, push } from "svelte-spa-router";

  $: selectedPmId = Number($params?.id ?? -1);

  let newPmType = "";
  let newPmName = "";
  let error = "";
  let message = "";

  const getUserId = (name: string) =>
    axios
      .get(`${import.meta.env.VITE_BACKEND_URI}/api/info/id/${name}`, {
        withCredentials: true,
      })
      .then(({ data }) => data as number)
      .catch(() => {
        error = "User does not exist";
        return -1;
      });

  const sendPrivateMessage = (id: number, m: string) => {
    if (!m || m.length === 0) return;

    $privateMessages.get(id)?.push({ message: m, me: true });
    $privateMessages = $privateMessages;

    $pmSocket.emit("sendMessage", { id, message: m });
  };

  $: if ($pendingPM > 0) $pendingPM = 0;

  let currentPm: { message: string; me: boolean }[] | undefined;
  $: {
    currentPm = $privateMessages.get(selectedPmId);

    if (selectedPmId !== -1 && !currentPm) {
      $privateMessages.set(selectedPmId, []);
      currentPm = $privateMessages.get(selectedPmId);
      $privateMessages = $privateMessages;
    }
  }

  let userInfo = new Map<number, { login: string; displayname: string }>();

  privateMessages.subscribe((value) =>
    Promise.each(
      value,
      async ([key, value]: [
        key: number,
        value: { message: string; me: boolean }[]
      ]) => {
        // we need this because typescript doesn't like it when we only get [key]
        // as argument.
        value;

        if (userInfo.has(key)) return;
        userInfo.set(
          key,
          (await getUserInfo(key)) as { login: string; displayname: string }
        );
      }
    ).then(() => (userInfo = userInfo))
  );
</script>

<div class="flex h-full">
  <div class="flex flex-row flex-auto w-full">
    <ul class="menu bg-base-200 w-1/6 rounded m-2">
      <li class="rounded">
        <label for="newpm-modal" class="modal-button">New private message</label
        >
      </li>
      {#each [...userInfo] as [id, { login, displayname }]}
        <li class="rounded {id === selectedPmId ? 'bordered' : ''}">
          <button on:click={() => push(`/pm/${id}`)}>
            <div class="avatar h-10 w-10">
              <ProfilePic user={login} attributes="rounded-full" />
            </div>
            {displayname}
          </button>
        </li>
      {/each}
    </ul>
    <div class="flex flex-auto flex-col w-2/3 m-2 bg-base-300 rounded">
      {#if currentPm}
        <div class="toast toast-end">
          {#each currentPm as { message, me }}
            <div class="alert {me ? 'alert-info' : 'alert-success'}">
              <div>
                <span>{message}</span>
              </div>
            </div>
          {/each}
        </div>
        <div class="flex rounded bg-base-200 p-2">
          <form
            class="form-control"
            on:submit|preventDefault={() => {
              sendPrivateMessage(selectedPmId, message);
              message = "";
            }}
          >
            <label class="input-group">
              <input
                bind:value={message}
                type="text"
                class="input bg-base-200"
              />
              <button type="submit">
                <svg
                  class="w-5 h-5 text-gray-500 origin-center transform rotate-90"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
                  />
                </svg>
              </button>
            </label>
          </form>
        </div>
      {:else}
        <div
          class="flex flex-auto items-center justify-center text-5xl font-bold"
        >
          <div class="flex h-min">Select or create a new chat.</div>
        </div>
      {/if}
    </div>
  </div>
</div>

<Modal id="newpm-modal">
  <svelte:fragment slot="content">
    <div class="flex flex-col">
      <h3 class="text-lg font-bold pb-4">Join channel</h3>
      <select bind:value={newPmType} class="select select-bordered">
        <option disabled selected>Choose new private message type</option>
        <option>Friend</option>
        <option>Other</option>
      </select>

      {#if newPmType === "Friend"}
        {#await getFriendList() then friendList}
          <div
            class="flex flex-row flex-wrap mt-4 -ml-4 -mb-4 flex-auto modal-action"
          >
            {#each friendList as id}
              {#await getUserInfo(id) then { displayname: name }}
                <label
                  for="newpm-modal"
                  class="btn flex-auto mb-4 ml-4"
                  on:click={() => {
                    if ($privateMessages.has(id)) return;
                    $privateMessages.set(id, []);
                    $privateMessages = $privateMessages;
                  }}
                  on:keypress={() => {
                    if ($privateMessages.has(id)) return;
                    $privateMessages.set(id, []);
                    $privateMessages = $privateMessages;
                  }}>{name}</label
                >
              {/await}
            {/each}
          </div>
        {:catch err}
          {err}
        {/await}
      {:else if newPmType === "Other"}
        {#if !isEmpty(error)}
          <div class="alert alert-error shadow-lg mt-4">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="stroke-current flex-shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                /></svg
              >
              <span>{error}</span>
            </div>
          </div>
        {/if}
        <div class="flex-col flex space-y-4">
          <div class="form-control mt-4">
            <label class="input-group">
              <span>Name</span>
              <input
                bind:value={newPmName}
                type="text"
                placeholder=""
                class="input input-bordered flex-auto"
              />
            </label>
          </div>
          <div class="modal-action">
            <label
              for="join-modal"
              class="btn btn-active btn-primary"
              on:click={async () => {
                const id = await getUserId(newPmName);

                if (id !== -1) {
                  $privateMessages.set(id, []);
                  $privateMessages = $privateMessages;
                }
              }}
              on:keypress={async () => {
                const id = await getUserId(newPmName);

                if (id !== -1) {
                  $privateMessages.set(id, []);
                  $privateMessages = $privateMessages;
                }
              }}>Select</label
            >
          </div>
        </div>
      {/if}
    </div>
  </svelte:fragment>
</Modal>
