<script lang="ts">
  import {
    acceptFriendRequest,
    addFriend,
    denyFriendRequest,
    getFriendList,
  } from "../utils/friend.js";
  import { pendingFriends } from "../stores/settings.js";
  import ProfilePic from "../lib/ProfilePic.svelte";
  import { getUserInfo } from "../utils/info.js";
  import { replace } from "svelte-spa-router";
  import LeftClickMenu from "../lib/LeftClickMenu.svelte";
  import { pick } from "ramda";

  let friendName = "";
  let status = -1;

  let message = "";
  let showMenu = -1;
  let pos = { x: 0, y: 0 };

  const openMenu = (e: MouseEvent, i: number) => {
    pos = pick(["x", "y"])(e);
    showMenu = i;
  };
</script>

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
  <div
    class="btn btn-active btn-primary"
    on:click={() =>
      addFriend(friendName).then((x) => ({ message, status } = x))}
  >
    Add
  </div>
</label>

<table class="table table-zebra w-full">
  <thead>
    <tr>
      <th colspan="4" class="text-center">Pending friend requests</th>
    </tr>
  </thead>
  <tbody>
    {#each $pendingFriends as id}
      {#await getUserInfo(id) then { login, displayname }}
        <tr>
          <td>
            <div class="flex content-center place-items-center space-x-5">
              <div class="avatar w-10 h-10">
                <ProfilePic attributes="rounded-full" user={login} />
              </div>
              <div class="italic">
                {login}
              </div>
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
              on:click={() => acceptFriendRequest(id) && replace(`/friends`)}
              >accept</button
            >
          </td>
          <td>
            <button
              class="btn btn-error"
              on:click={() => denyFriendRequest(id) && replace(`/friends`)}
              >deny</button
            >
          </td>
        </tr>
      {/await}
    {/each}
  </tbody>
</table>

<table class="table table-zebra w-full">
  <thead>
    <tr>
      <th colspan="2" class="text-center">Friends</th>
    </tr>
  </thead>
  <tbody>
    {#await getFriendList() then friendList}
      {#each friendList as id}
        {#await getUserInfo(id) then { login, displayname, status }}
          <tr>
            <td>
              <div
                class="flex flex-row content-center place-items-center space-x-5"
              >
                <div
                  on:click|preventDefault={(e) => openMenu(e, id)}
                  class="btn btn-ghost btn-circle avatar"
                >
                  <ProfilePic
                    attributes="h-10 w-10 rounded-full"
                    user={login}
                    {status}
                  />
                </div>
                {#if showMenu === id}
                  <LeftClickMenu
                    on:clickoutside={() => (showMenu = -1)}
                    uid={id}
                    {pos}
                  />
                {/if}
                <div class="italic">
                  {login}
                </div>
              </div>
            </td>
            <td>
              <div class="flex place-items-center">
                {displayname}
              </div>
            </td>
          </tr>
        {/await}
      {/each}
    {/await}
  </tbody>
</table>
