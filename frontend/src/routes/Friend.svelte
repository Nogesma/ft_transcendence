<script lang="ts">
  import {
    acceptFriendRequest,
    addFriend,
    delFriend,
    denyFriendRequest,
  } from "../utils/friend.js";
  import { friends, pendingFriends } from "../stores/settings.js";
  import ProfilePic from "../lib/ProfilePic.svelte";
  import { getUserInfo } from "../utils/info.js";
  import { push } from "svelte-spa-router";
  import LeftClickMenu from "../lib/LeftClickMenu.svelte";
  import { pick } from "ramda";

  let friendName = "";
  let status = -1;

  let message = "";
  let showMenu = -1;
  let pos = { x: 0, y: 0 };
  let table: Element;
  let pendingTable: Element;

  const openMenu = (e: MouseEvent, i: number) => {
    pos = pick(["x", "y"])(e);

    const t = $pendingFriends.has(i) ? pendingTable : table;
    if (t) {
      const bounds = t.getBoundingClientRect();
      pos.y -= bounds.y;
      pos.x -= bounds.x;
    }

    showMenu = i;
  };
</script>

<div class="gap-5 flex flex-col p-5">
  {#if status !== -1}
    {#if status === 0}
      <div class="alert alert-success shadow-lg mb-5">
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            /></svg
          >
          <span>{message}</span>
        </div>
      </div>
    {:else}
      <div class="alert alert-error shadow-lg mb-5">
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
          <span>{message}</span>
        </div>
      </div>
    {/if}
  {/if}

  <label class="input-group">
    <span>Name</span>
    <input
      bind:value={friendName}
      type="text"
      placeholder=""
      class="input input-bordered flex-auto"
    />
    <button
      class="btn btn-active btn-primary"
      on:click={() =>
        addFriend(friendName).then((x) => ({ message, status } = x))}
    >
      Add
    </button>
  </label>

  {#if $pendingFriends.size !== 0}
    <table class="table table-zebra w-full">
      <thead bind:this={pendingTable}>
        <tr>
          <th colspan="5" class="text-center">Pending friend requests</th>
        </tr>
      </thead>
      <tbody>
        {#each [...$pendingFriends] as id}
          {#await getUserInfo(id) then { login, displayname }}
            <tr>
              <td>
                <div
                  class="flex flex-row content-center place-items-center space-x-5"
                >
                  <button
                    on:click|preventDefault={(e) => openMenu(e, id)}
                    class="btn btn-ghost btn-circle avatar"
                  >
                    <ProfilePic
                      attributes="h-10 w-10 rounded-full"
                      user={login}
                    />
                  </button>
                </div>
                {#if showMenu === id}
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
                  class="btn btn-accent"
                  on:click={() => acceptFriendRequest(id)}>accept</button
                >
              </td>
              <td>
                <button
                  class="btn btn-error"
                  on:click={() => denyFriendRequest(id)}>ignore</button
                >
              </td>
            </tr>
          {/await}
        {/each}
      </tbody>
    </table>
  {/if}

  <table class="table table-zebra w-full">
    <thead bind:this={table}>
      <tr>
        <th colspan="6" class="text-center">Friends</th>
      </tr>
    </thead>
    <tbody>
      {#each [...$friends] as id}
        {#await getUserInfo(id) then { login, displayname }}
          <tr>
            <td>
              <div
                class="flex flex-row content-center place-items-center space-x-5"
              >
                <button
                  on:click|preventDefault={(e) => openMenu(e, id)}
                  class="btn btn-ghost btn-circle avatar"
                >
                  <ProfilePic
                    attributes="h-10 w-10 rounded-full"
                    user={login}
                  />
                </button>
              </div>
              {#if showMenu === id}
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
              <button class="btn btn-primary" on:click={() => push(`/pm/${id}`)}
                >Private Message
              </button>
            </td>
            <td>
              <button
                class="btn btn-primary"
                on:click={() => push(`/users/${id}`)}>View Profile</button
              >
            </td>
            <td>
              <button class="btn btn-error" on:click={() => delFriend(id)}
                >Remove friend</button
              >
            </td>
          </tr>
        {/await}
      {/each}
    </tbody>
  </table>
</div>
