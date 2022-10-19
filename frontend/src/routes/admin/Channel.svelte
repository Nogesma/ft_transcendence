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
  import { pick } from "ramda";
  import LeftClickMenu from "../../lib/LeftClickMenu.svelte";
  import { onMount } from "svelte";
  import dayjs from "dayjs";
  import { chatSocket } from "../../stores/settings";
  import { id } from "../../stores/settings.js";
  import Modal from "../../lib/Modal.svelte";

  export let params: { adminChannel: string };

  let admin = 0;
  let name = "";

  let muteList: Promise<{ user: number; expires: Date }[]>;
  let banList: Promise<{ user: number; expires: Date }[]>;
  let adminList: Promise<number[]> | null;

  onMount(async () => {
    name = params.adminChannel;
    if (!name) await replace("/404");

    admin = await isAdmin(name);
    if (!admin) await replace("/404");

    muteList = getMuteList(name) as Promise<{ user: number; expires: Date }[]>;
    banList = getBanList(name) as Promise<{ user: number; expires: Date }[]>;
    adminList = admin === 2 ? (getAdminList(name) as Promise<number[]>) : null;
  });

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
          {#await adminList then admins}
            {#if admins}
              {#each admins as uid}
                {#if uid !== $id}
                  {#await getUserInfo(uid) then { login, displayname }}
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
                          on:click={() => push(`/users/${uid}`)}
                          >View Profile</button
                        >
                      </td>
                      <td>
                        <button
                          class="btn btn-error"
                          on:click={() =>
                            removeAdmin(name, login).then(
                              () => (adminList = getAdminList(name))
                            )}>Remove Admin</button
                        >
                      </td>
                    </tr>
                  {/await}
                {/if}
              {/each}
            {/if}
          {/await}
        </tbody>
      </table>
      <label for="delete-modal" class="btn btn-error modal-button"
        >Delete channel {name}</label
      >
    {/if}
  {/if}
</div>

<Modal id="delete-modal">
  <svelte:fragment slot="content">
    <div class="flex flex-col gap-4">
      <h3 class="text-lg font-bold">Permanentely delete {name}</h3>
      <label
        for="delete-modal"
        class="btn btn-error"
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
