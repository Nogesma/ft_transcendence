<script lang="ts">
  import ProfilePic from "../../lib/ProfilePic.svelte";
  import { push } from "svelte-spa-router";
  import { displayname, id, login } from "../../stores/settings.js";
  import { getUserInfo, getUserStats } from "../../utils/info.js";
  import Settings from "../../lib/Settings.svelte";
  import { isEmpty } from "ramda";
  import { addFriend, delFriend } from "../../utils/friend.js";
  import {
    blockUser,
    getUserPermissions,
    unblockUser,
  } from "../../utils/chatManagement.js";

  export let params: { id: number };

  const uid: number = Number(params?.id) ?? $id;
</script>

{#await getUserInfo(uid) then { login: lname, displayname: dname, status, gameId }}
  <div class="hero h-full">
    <div class="hero-content flex-col lg:flex-row justify-start w-full">
      <ProfilePic
        attributes="max-w-sm rounded-lg shadow-2xl"
        user={lname}
        {status}
      />
      <div class="flex flex-col ml-6 space-y-6 content-start">
        <div class="flex flex-row gap-4 items-end">
          <h1 class="text-5xl font-bold">
            {uid === $id ? $displayname : dname}
          </h1>
          <p class="italic">{uid === $id ? $login : lname}</p>
        </div>
        {#await getUserStats(uid) then { wins, losses, elo, highestElo }}
          <div class="flex flex-row space-x-4">
            <table class="table table-zebra w-full flex-auto">
              <thead>
                <tr>
                  <th>Win</th>
                  <th>Loss</th>
                  <th>Ratio</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{wins}</td>
                  <td>{losses}</td>
                  <td>{losses !== 0 ? wins / losses : 0}</td>
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
        {/await}
        {#if (status === 2 || status === 3) && gameId && !isEmpty(gameId)}
          <button
            class="btn btn-secondary"
            on:click={() => push(`/game/${gameId}`)}
            >Spectate
          </button>
        {/if}
        {#if uid !== $id}
          {#await getUserPermissions(uid) then { block, friend }}
            {#if !friend}
              <button
                class="btn btn-secondary"
                on:click={() => addFriend(lname)}>Add friend</button
              >
            {:else}
              <button
                class="btn btn-secondary"
                on:click={() => delFriend(lname)}>Remove friend</button
              >
            {/if}
            {#if !block}
              <button class="btn btn-secondary" on:click={() => blockUser(uid)}
                >Block</button
              >
            {:else}
              <button
                class="btn btn-secondary"
                on:click={() => unblockUser(uid)}>Unblock</button
              >
            {/if}
          {/await}
        {/if}
        <button
          class="btn btn-primary"
          on:click={() => push(`/users/${uid}/history`)}
          >Match History
        </button>
        {#if uid === $id}
          <Settings />
        {/if}
      </div>
    </div>
  </div>
{/await}
