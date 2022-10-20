<script lang="ts">
  import { isAdmin } from "../../utils/chatManagement";
  import { push, replace } from "svelte-spa-router";
  import {
    deleteChannel,
    getAdminList,
    getBanList,
    getMuteList,
    removeAdmin,
    unbanUser,
    unmuteUser,
  } from "../../utils/chatManagement.js";
  import { getUserInfo } from "../../utils/info.js";
  import ProfilePic from "../../lib/ProfilePic.svelte";
  import { isEmpty, pick } from "ramda";
  import LeftClickMenu from "../../lib/LeftClickMenu.svelte";
  import { onMount } from "svelte";
  import dayjs from "dayjs";
  import { chatSocket } from "../../stores/settings";
  import { id } from "../../stores/settings.js";
  import Modal from "../../lib/Modal.svelte";
  import axios from "axios";

  import Bluebird from "bluebird";
  import type { Writable } from "svelte/store";
  import { writable } from "svelte/store";

  export let params: { adminChannel: string };

  let admin = 0;
  let name = "";

  let muteList: Promise<{ user: number; expires: Date }[]>;
  let banList: Promise<{ user: number; expires: Date }[]>;
  let adminList: Writable<Promise<number[]> | null> = writable(null);
  let channelType: Promise<number> | null;

  const getChannelType = (chan: string) =>
    axios
      .get(`${import.meta.env.VITE_BACKEND_URI}/api/chat/type/${chan}`, {
        withCredentials: true,
      })
      .then(({ data }) => data)
      .catch(console.error);

  const changeChannelType = (chan: string, type: number, password: string) =>
    axios
      .post(
        `${import.meta.env.VITE_BACKEND_URI}/api/chat/type/${chan}`,
        {
          type,
          password,
        },
        {
          withCredentials: true,
        }
      )
      .then(({ data }) => data)
      .catch(console.error);

  const changeOwner = (chan: string, owner: number) =>
    axios
      .post(
        `${
          import.meta.env.VITE_BACKEND_URI
        }/api/chat/changeOwner/${chan}/${owner}`,
        {},
        {
          withCredentials: true,
        }
      )
      .then(({ data }) => data)
      .catch(console.error);

  const getUserId = (name: string) =>
    axios
      .get(`${import.meta.env.VITE_BACKEND_URI}/api/info/id/${name}`, {
        withCredentials: true,
      })
      .then(({ data }) => {
        error = "";
        return data as number;
      })
      .catch(() => {
        error = "User does not exist";
        return -1;
      });

  const addUserToChannel = async (chan: string, user: string) => {
    const uid = await getUserId(user);
    if (uid === -1) return;
    axios
      .post(
        `${import.meta.env.VITE_BACKEND_URI}/api/chat/add/${chan}/${uid}`,
        {},
        {
          withCredentials: true,
        }
      )
      .then(() => (checkbox.checked = false))
      .catch((e) => (error = e.response.data.message));
  };

  const getAdminData = async () => {
    name = params.adminChannel;
    if (!name) await replace("/404");

    admin = await isAdmin(name);
    if (!admin) await replace("/404");

    muteList = getMuteList(name) as Promise<{ user: number; expires: Date }[]>;
    banList = getBanList(name) as Promise<{ user: number; expires: Date }[]>;
    adminList.set(
      admin === 2 ? (getAdminList(name) as Promise<number[]>) : null
    );
    channelType =
      admin === 2 ? (getChannelType(name) as Promise<number>) : null;
  };

  let showMenu = -1;
  let pos = { x: 0, y: 0 };
  let muteTable: Element;
  let banTable: Element;
  let adminTable: Element;

  const openMenu = (e: MouseEvent, i: number, table?: Element) => {
    pos = pick(["x", "y"])(e);

    if (table) {
      const bounds = table.getBoundingClientRect();
      pos.y -= bounds.y;
      pos.x -= bounds.x;
    }

    showMenu = i;
  };

  let verifiedName: string;
  let newOwner: number;
  let adminInfo = new Map<number, { login: string; displayname: string }>();
  let newChannelType: number;

  adminList.subscribe((al) =>
    al?.then((x) => {
      adminInfo.forEach((value, key, map) => {
        value;
        if (!x.includes(key)) map.delete(key);
      });
      Bluebird.each(x, async (v: number) => {
        if (adminInfo.has(v)) return;
        adminInfo.set(
          v,
          (await getUserInfo(v)) as { login: string; displayname: string }
        );
      }).then(() => (adminInfo = adminInfo));
    })
  );

  onMount(getAdminData);

  $: channelPassword = "" && newChannelType !== 1;

  let error = "";
  let checkbox: HTMLInputElement;
</script>

<div class="gap-5 flex flex-col p-5">
  {#if admin}
    <!-- Manage mutes -->
    <table class="table table-zebra w-full">
      <thead bind:this={muteTable}>
        <tr>
          <th colspan="7" class="text-center">Muted</th>
        </tr>
      </thead>
      <tbody>
        {#await muteList then mutes}
          {#each mutes as { user: uid, expires }}
            {#await getUserInfo(uid) then { login, displayname }}
              <tr>
                <td>
                  <div
                    class="flex flex-row content-center place-items-center space-x-5"
                  >
                    <button
                      on:click|preventDefault={(e) =>
                        openMenu(e, uid, muteTable)}
                      class="btn btn-ghost btn-circle avatar"
                    >
                      <ProfilePic
                        attributes="h-10 w-10 rounded-full"
                        user={login}
                      />
                    </button>
                  </div>
                  {#if showMenu === uid}
                    <LeftClickMenu
                      on:clickoutside={() => (showMenu = -1)}
                      {uid}
                      {pos}
                    />
                  {/if}
                </td>
                <td>
                  <div class="italic">
                    {login}
                  </div>
                </td>
                <td>
                  <div class="flex place-items-center">
                    {displayname}
                  </div>
                </td>
                <td>
                  <button
                    class="btn btn-primary"
                    on:click={() => push(`/pm/${uid}`)}
                    >Private Message
                  </button>
                </td>
                <td>
                  <button
                    class="btn btn-primary"
                    on:click={() => push(`/users/${uid}`)}>View Profile</button
                  >
                </td>
                <td
                  >{dayjs(expires).isSame(dayjs(0))
                    ? "Infinite"
                    : dayjs(expires).format()}</td
                >
                <td>
                  <button
                    class="btn btn-error"
                    on:click={() => {
                      unmuteUser($chatSocket, name, login);
                      setTimeout(() => (muteList = getMuteList(name)), 100);
                    }}>Unmute</button
                  >
                </td>
              </tr>
            {/await}
          {/each}
        {/await}
      </tbody>
    </table>

    <!-- Manage bans -->
    <table class="table table-zebra w-full">
      <thead bind:this={banTable}>
        <tr>
          <th colspan="7" class="text-center">Bans</th>
        </tr>
      </thead>
      <tbody>
        {#await banList then bans}
          {#each bans as { user: uid, expires }}
            {#await getUserInfo(uid) then { login, displayname }}
              <tr>
                <td>
                  <div
                    class="flex flex-row content-center place-items-center space-x-5"
                  >
                    <button
                      on:click|preventDefault={(e) =>
                        openMenu(e, uid, banTable)}
                      class="btn btn-ghost btn-circle avatar"
                    >
                      <ProfilePic
                        attributes="h-10 w-10 rounded-full"
                        user={login}
                      />
                    </button>
                  </div>
                  {#if showMenu === uid}
                    <LeftClickMenu
                      on:clickoutside={() => (showMenu = -1)}
                      {uid}
                      {pos}
                    />
                  {/if}
                </td>
                <td>
                  <div class="italic">
                    {login}
                  </div>
                </td>
                <td>
                  <div class="flex place-items-center">
                    {displayname}
                  </div>
                </td>
                <td>
                  <button
                    class="btn btn-primary"
                    on:click={() => push(`/pm/${uid}`)}
                    >Private Message
                  </button>
                </td>
                <td>
                  <button
                    class="btn btn-primary"
                    on:click={() => push(`/users/${uid}`)}>View Profile</button
                  >
                </td>
                <td
                  >{dayjs(expires).isSame(dayjs(0))
                    ? "Infinite"
                    : dayjs(expires).format()}</td
                >
                <td>
                  <button
                    class="btn btn-error"
                    on:click={() => {
                      unbanUser($chatSocket, name, login);
                      setTimeout(() => (banList = getBanList(name)), 100);
                    }}>Unban</button
                  >
                </td>
              </tr>
            {/await}
          {/each}
        {/await}
      </tbody>
    </table>

    {#if admin === 2}
      <!-- Manage Admins -->
      <table class="table table-zebra w-full">
        <thead bind:this={adminTable}>
          <tr>
            <th colspan="6" class="text-center">Admins</th>
          </tr>
        </thead>
        <tbody>
          {#each [...adminInfo] as [uid, { login, displayname }]}
            {#if uid !== $id}
              <tr>
                <td>
                  <div
                    class="flex flex-row content-center place-items-center space-x-5"
                  >
                    <button
                      on:click|preventDefault={(e) =>
                        openMenu(e, uid, adminTable)}
                      class="btn btn-ghost btn-circle avatar"
                    >
                      <ProfilePic
                        attributes="h-10 w-10 rounded-full"
                        user={login}
                      />
                    </button>
                  </div>
                  {#if showMenu === uid}
                    <LeftClickMenu
                      on:clickoutside={() => (showMenu = -1)}
                      {uid}
                      {pos}
                    />
                  {/if}
                </td>
                <td>
                  <div class="italic">
                    {login}
                  </div>
                </td>
                <td>
                  <div class="flex place-items-center">
                    {displayname}
                  </div>
                </td>
                <td>
                  <button
                    class="btn btn-primary"
                    on:click={() => push(`/pm/${uid}`)}
                    >Private Message
                  </button>
                </td>
                <td>
                  <button
                    class="btn btn-primary"
                    on:click={() => push(`/users/${uid}`)}>View Profile</button
                  >
                </td>
                <td>
                  <button
                    class="btn btn-error"
                    on:click={() =>
                      removeAdmin(name, login).then(() =>
                        adminList.set(getAdminList(name))
                      )}>Remove Admin</button
                  >
                </td>
              </tr>
            {/if}
          {/each}
        </tbody>
      </table>
      <div class="flex flex-auto flex-row justify-evenly gap-5">
        {#await channelType then type}
          {#if type === 2}
            <label for="add-modal" class="flex-grow btn modal-button"
              >Add user to channel</label
            >
          {/if}
        {/await}
        <label for="type-modal" class="flex-grow btn btn-error modal-button"
          >Change password/type of channel</label
        >
        <label for="owner-modal" class="flex-grow btn btn-error modal-button"
          >Change owner</label
        >
        <label for="delete-modal" class="flex-grow btn btn-error modal-button"
          >Delete channel {name}</label
        >
      </div>
    {/if}
  {/if}
</div>

<Modal bind:inputElement={checkbox} id="add-modal">
  <svelte:fragment slot="content">
    <div class="flex flex-col">
      <h3 class="text-lg font-bold pb-4">Add user to channel</h3>

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
              bind:value={verifiedName}
              type="text"
              placeholder=""
              class="input input-bordered flex-auto"
            />
          </label>
        </div>
        <button
          class="btn btn-active btn-primary {isEmpty(verifiedName)
            ? 'btn-disabled'
            : ''}"
          on:click={() => addUserToChannel(name, verifiedName)}
          on:keypress={() => addUserToChannel(name, verifiedName)}
          >Select</button
        >
      </div>
    </div>
  </svelte:fragment>
</Modal>

<Modal id="type-modal">
  <svelte:fragment slot="content">
    <div class="flex flex-col space-y-4">
      <h3 class="text-lg font-bold">Switch channel type</h3>
      <div class="form-control gap-4">
        <select bind:value={newChannelType} class="select select-bordered">
          <option disabled selected>Choose channel type</option>
          <option value={0}>Public</option>
          <option value={1}>Private</option>
          <option value={2}>Invite only</option>
        </select>

        {#if newChannelType === 1}
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
        <label class="input-group">
          <span>Confirm channel name</span>
          <input
            bind:value={verifiedName}
            type="text"
            placeholder=""
            class="input input-bordered flex-auto"
          />
        </label>
      </div>
      <div class="modal-action">
        <label
          for="type-modal"
          class="btn btn-error {verifiedName === name ? '' : 'btn-disabled'}"
          on:click={() =>
            changeChannelType(name, newChannelType, channelPassword).then(
              getAdminData
            )}
          on:keypress={() =>
            changeChannelType(name, newChannelType, channelPassword).then(
              getAdminData
            )}>Confirm</label
        >
      </div>
    </div>
  </svelte:fragment>
</Modal>

<Modal id="owner-modal">
  <svelte:fragment slot="content">
    <div class="flex flex-col gap-4">
      <h3 class="text-lg font-bold">Change owner</h3>
      <div class="form-control gap-4">
        <select bind:value={newOwner} class="select select-bordered">
          {#each [...adminInfo] as [uid, { login }]}
            {#if uid !== $id}
              <option value={uid}>{login}</option>
            {/if}
          {/each}
        </select>
        <label class="input-group">
          <span>Confirm channel name</span>
          <input
            bind:value={verifiedName}
            type="text"
            placeholder=""
            class="input input-bordered flex-auto"
          />
        </label>
      </div>
      <label
        for="owner-modal"
        class="btn btn-error {verifiedName === name ? '' : 'btn-disabled'}"
        on:click={() => changeOwner(name, newOwner).then(getAdminData)}
        on:keypress={() => changeOwner(name, newOwner).then(getAdminData)}
        >Confirm</label
      >
    </div>
  </svelte:fragment>
</Modal>

<Modal id="delete-modal">
  <svelte:fragment slot="content">
    <div class="flex flex-col gap-4">
      <h3 class="text-lg font-bold">Permanentely delete {name}</h3>
      <div class="form-control">
        <label class="input-group">
          <span>Channel name</span>
          <input
            bind:value={verifiedName}
            type="text"
            placeholder=""
            class="input input-bordered flex-auto"
          />
        </label>
      </div>
      <label
        for="delete-modal"
        class="btn btn-error {verifiedName === name ? '' : 'btn-disabled'}"
        on:click={() => {
          deleteChannel($chatSocket, name);
          push("/");
        }}
        on:keypress={() => {
          deleteChannel($chatSocket, name);
          push("/");
        }}>Confirm</label
      >
    </div>
  </svelte:fragment>
</Modal>
