<script lang="ts">
  import ProfilePic from "./ProfilePic.svelte";
  import { id, isLoggedIn, login, pendingFriends } from "../stores/settings.js";
  import axios from "axios";
  import { getPendingFriendRequests } from "../utils/friend";
  import { isEmpty } from "ramda";
  import { push } from "svelte-spa-router";

  const logout = () => {
    axios
      .post(
        `${import.meta.env.VITE_BACKEND_URI}/api/auth/logout`,
        {},
        { withCredentials: true }
      )
      .then(() => location.reload());
  };

  $: if ($id !== 0)
    getPendingFriendRequests().then((x) => ($pendingFriends = x));
</script>

<div class="navbar bg-base-100">
  <div class="flex-1">
    <a href="#/" class="btn btn-ghost normal-case text-xl">Transcendence</a>
  </div>
  {#if $isLoggedIn}
    <div class="flex-none space-x-4">
      <div class="dropdown dropdown-end">
        <div
          tabindex="0"
          class="btn btn-ghost btn-circle"
          on:click={() => push("/friends")}
        >
          <div class="indicator">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              /></svg
            >
            {#if !isEmpty($pendingFriends)}
              <span class="badge badge-sm indicator-item badge-error"
                >{$pendingFriends.length}</span
              >
            {/if}
          </div>
        </div>
      </div>
      <div class="dropdown dropdown-end">
        <div tabindex="0" class="btn btn-ghost btn-circle avatar">
          <ProfilePic user={$login} attributes="h-10 w-10 rounded-full" />
        </div>
        <ul
          tabindex="0"
          class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li>
            <a href="#/users/{$id}">Profile</a>
          </li>
          <li><button on:click={logout}>Logout</button></li>
        </ul>
      </div>
    </div>
  {/if}
</div>
