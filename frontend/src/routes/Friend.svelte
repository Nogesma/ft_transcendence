<script lang="ts">
  import {
    acceptFriendRequest,
    addFriend,
    denyFriendRequest,
    getFriendList,
  } from "../utils/friend.js";
  import { pendingFriends } from "../stores/settings.js";

  let friendName = "";
  let status = -1;

  let message = "";
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

{#each $pendingFriends as id, i}
  <div>
    {i}: {id}
    <button class="btn btn-accent" on:click={() => acceptFriendRequest(id)}
      >accept</button
    >
    <button class="btn btn-error" on:click={() => denyFriendRequest(id)}
      >deny</button
    >
  </div>
{/each}

{#await getFriendList() then friendList}
  {#each friendList as id, i}
    {i}: {id}
  {/each}
{/await}
