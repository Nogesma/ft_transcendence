<script lang="ts">
  import ProfilePic from "../../lib/ProfilePic.svelte";
  import axios from "axios";
  import { push } from "svelte-spa-router";
  import { getUserData } from "../../utils/auth";
  import { displayname, id, updatepfp } from "../../stores/settings.js";
  import QRCode from "qrcode";
  import TFAInput from "../../lib/2faInput.svelte";
  import Modal from "../../lib/Modal.svelte";
  import { onMount } from "svelte";

  export let params: { id: number };

  let newDisplayName: string, file: FileList, tfa: Promise<Node>;

  let elem: HTMLElement;

  onMount(() => elem.appendChild(document.createElement("div")));

  const uid: number = Number(params?.id) ?? $id;

  const getUserStats = () =>
    axios
      .get(`${import.meta.env.VITE_BACKEND_URI}/api/info/${uid}`, {
        withCredentials: true,
      })
      .then(({ data }) => data)
      .catch(console.error);

  const updateUserName = async () =>
    axios
      .post(
        `${import.meta.env.VITE_BACKEND_URI}/api/user/name`,
        { name: newDisplayName },
        {
          withCredentials: true,
        }
      )
      .then(getUserData)
      .catch((err) => console.error(err));

  const uploadAvatar = async () => {
    const form = new FormData();
    form.append("file", file[0]);

    await axios
      .post(`${import.meta.env.VITE_BACKEND_URI}/api/user/avatar`, form, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => $updatepfp++); // todo: find a way to update avatar in <Profile />
  };

  const resetAvatar = () =>
    axios
      .delete(`${import.meta.env.VITE_BACKEND_URI}/api/user/avatar`, {
        withCredentials: true,
      })
      .then(() => $updatepfp++); // todo: find a way to update avatar in <Profile />

  const request2FA = async () =>
    axios
      .get(`${import.meta.env.VITE_BACKEND_URI}/api/user/2fa`, {
        withCredentials: true,
      })
      .then(async ({ data }) =>
        elem.replaceChild(
          await QRCode.toCanvas(data.otpauthURL),
          elem.firstChild as Node
        )
      )
      //todo: do case where user is not authenticated
      .catch();
</script>

{#await getUserStats()}
  ...
{:then { login, displayname: name, win, losses, elo, highestElo }}
  <div class="hero min-h-screen bg-base-200">
    <div class="hero-content flex-col lg:flex-row justify-start w-full">
      <ProfilePic attributes="max-w-sm rounded-lg shadow-2xl" user={login} />
      <div class="flex flex-col ml-6 space-y-6 content-start">
        <h1 class="text-5xl font-bold">
          {uid === $id ? $displayname : name}
        </h1>
        <div class="flex flex-row space-x-4">
          <table class="table table-zebra w-full flex-auto">
            <thead>
              <tr>
                <th>Win</th>
                <th>Loss</th>
                <th>Ratio (%)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{win}</td>
                <td>{losses}</td>
                <td>{losses !== 0 ? (win / losses) * 100 : 100}%</td>
              </tr>
            </tbody>
          </table>
          <table class="table table-zebra w-full flex-auto">
            <thead>
              <tr>
                <th>Current Elo</th>
                <th>Highest Elo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{elo}</td>
                <td>{highestElo}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <button
          class="btn btn-primary"
          on:click={() => push(`/users/history/${id}`)}
          >Match History
        </button>
        {#if uid === $id}
          <h1 class="text-5xl font-bold">Settings</h1>
          <div class="flex flex-row space-x-4">
            <label for="change-displayname" class="btn btn-primary modal-button"
              >Change display name</label
            >
            <label for="change-avatar" class="btn btn-primary modal-button"
              >Change Avatar</label
            >
            <label
              for="toggle-2fa"
              class="btn btn-primary modal-button"
              on:click={() => (tfa = request2FA())}>Enable 2FA</label
            >
          </div>
        {/if}
      </div>
    </div>
  </div>
{/await}

<Modal id="change-displayname">
  <svelte:fragment slot="content">
    <div class="flex flex-col">
      <h3 class="text-lg font-bold pb-4">CHange display name</h3>
      <label class="input-group">
        <span>Name</span>
        <input
          bind:value={newDisplayName}
          type="text"
          size="28"
          placeholder={$displayname}
          class="input input-bordered flex-auto"
        />
      </label>
      <div class="modal-action">
        <label
          for="change-displayname"
          class="btn btn-active btn-primary"
          on:click={updateUserName}>Modify</label
        >
      </div>
    </div>
  </svelte:fragment>
</Modal>

<Modal id="change-avatar">
  <svelte:fragment slot="content">
    <div class="flex flex-col">
      <h3 class="text-lg font-bold pb-4">Change avatar</h3>
      <label class="input-group">
        <input
          type="file"
          accept="image/jpeg"
          id="avatar_upload"
          bind:files={file}
        />
      </label>
      <div class="modal-action">
        <label
          for="change-avatar"
          class="btn btn-active btn-primary"
          on:click={resetAvatar}>Reset avatar</label
        >
      </div>
      <div class="modal-action">
        <label
          for="change-avatar"
          class="btn btn-active btn-primary"
          on:click={uploadAvatar}>Upload</label
        >
      </div>
    </div>
  </svelte:fragment>
</Modal>

<Modal id="toggle-2fa">
  <svelte:fragment slot="content">
    <div class="flex flex-col">
      <h3 class="text-lg font-bold pb-4">Enable 2FA</h3>

      <div bind:this={elem} />

      {#await tfa then _}
        <TFAInput modalId="toggle-2fa" url="api/user/2fa" />
      {/await}
    </div>
  </svelte:fragment>
</Modal>
