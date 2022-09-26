<script lang="ts">
  import { fade } from "svelte/transition";
  import ProfilePic from "./ProfilePic.svelte";
  import { push } from "svelte-spa-router";
  import { getUserInfo } from "../utils/info.js";

  export let id = 0;
</script>

{#if id}
  <div
    class="card card-side bg-base-100 shadow"
    transition:fade={{ duration: 100 }}
  >
    {#await getUserInfo(id) then { login, displayname, status }}
      <ProfilePic attributes="max-h-56" user={login} {status} />
      <div class="card-body">
        <h2 class="card-title">{displayname}</h2>
        <p class="italic">{login}</p>
        <div class="card-actions justify-end">
          <button class="btn btn-primary" on:click={() => push(`/users/${id}`)}
            >View Profile</button
          >
        </div>
      </div>
    {/await}
  </div>
{/if}
