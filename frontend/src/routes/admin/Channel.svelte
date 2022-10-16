<script lang="ts">
  import { isAdmin } from "../../utils/chatManagement";
  import { push, replace } from "svelte-spa-router";
  import {
    getAdminList,
    getBanList,
    getMuteList,
    removeAdmin,
    unbanUser,
  } from "../../utils/chatManagement.js";
  import { getUserInfo } from "../../utils/info.js";
  import ProfilePic from "../../lib/ProfilePic.svelte";
  import { pick } from "ramda";
  import LeftClickMenu from "../../lib/LeftClickMenu.svelte";
  import { onMount } from "svelte";
  import Icon from "svelte-awesome";
  import { faPlus } from "@fortawesome/free-solid-svg-icons";
  import dayjs from "dayjs";
  import { chatSocket } from "../../stores/settings";
  import { id } from "../../stores/settings.js";

  export let params: { adminChannel: string };

  let admin = 0;
  let name = "";
  onMount(async () => {
    name = params.adminChannel;
    if (!name) await replace("/404");

    admin = await isAdmin(name);
    if (!admin) await replace("/404");

    $chatSocket.emit("joinRoom", { channel: name });
  });

  let showMenu = -1;
  let pos = { x: 0, y: 0 };
  let muteTable: Element;
  let banTable: Element;
  let adminTable: Element;
  const openMenu = (e: MouseEvent, i: number) => {
    pos = pick(["x", "y"])(e);

    const table = adminTable;
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
    {#await getMuteList(name) then mutes}
      <table class="table table-zebra w-full">
        <thead bind:this={muteTable}>
          <tr>
            <th colspan="5" class="text-center">Muted</th>
            <th class="text-right p-0 pr-5">
              <label for="add-mute" class="modal-button btn btn-circle btn-sm">
                <Icon data={faPlus} />
              </label>
            </th>
          </tr>
        </thead>
        <tbody>
          {#each mutes as { id: uid, time }}
            {#await getUserInfo(uid) then { login, displayname }}
              <tr>
                <td>
                  <div
                    class="flex flex-row content-center place-items-center space-x-5"
                  >
                    <button
                      on:click|preventDefault={(e) => openMenu(e, uid)}
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
                      uid={id}
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
                <td>{dayjs(time).format()}</td>
                <td>
                  <button
                    class="btn btn-error"
                    on:click={() => removeAdmin(uid)}>Remove mute</button
                  >
                </td>
              </tr>
            {/await}
          {/each}
        </tbody>
      </table>
    {/await}

    <!-- Manage bans -->
    {#await getBanList(name) then bans}
      <table class="table table-zebra w-full">
        <thead bind:this={banTable}>
          <tr>
            <th colspan="5" class="text-center">Bans</th>
            <th class="text-right p-0 pr-5">
              <label for="add-ban" class="modal-button btn btn-circle btn-sm">
                <Icon data={faPlus} />
              </label>
            </th>
          </tr>
        </thead>
        <tbody>
          {#each bans as { id: uid, time }}
            {#await getUserInfo(uid) then { login, displayname }}
              <tr>
                <td>
                  <div
                    class="flex flex-row content-center place-items-center space-x-5"
                  >
                    <button
                      on:click|preventDefault={(e) => openMenu(e, uid)}
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
                      uid={id}
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
                <td>{dayjs(time).format()}</td>
                <td>
                  <button class="btn btn-error" on:click={() => unbanUser(uid)}
                    >Unban</button
                  >
                </td>
              </tr>
            {/await}
          {/each}
        </tbody>
      </table>
    {/await}

    {#if admin === 2}
      <!-- Manage Admins -->
      {#await getAdminList(name) then admins}
        <table class="table table-zebra w-full">
          <thead bind:this={adminTable}>
            <tr>
              <th colspan="5" class="text-center">Admins</th>
              <th class="text-right p-0 pr-5">
                <label
                  for="add-admin"
                  class="modal-button btn btn-circle btn-sm"
                >
                  <Icon data={faPlus} />
                </label>
              </th>
            </tr>
          </thead>
          <tbody>
            {#each admins as uid}
              {#if uid !== $id}
                {#await getUserInfo(uid) then { login, displayname }}
                  <tr>
                    <td>
                      <div
                        class="flex flex-row content-center place-items-center space-x-5"
                      >
                        <button
                          on:click|preventDefault={(e) => openMenu(e, uid)}
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
                          uid={id}
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
                        on:click={() => removeAdmin(uid)}>Remove Admin</button
                      >
                    </td>
                  </tr>
                {/await}
              {/if}
            {/each}
          </tbody>
        </table>
      {/await}
    {/if}
  {/if}
</div>
