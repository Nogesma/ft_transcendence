<script lang="ts">
  import Icon from "svelte-awesome";
  import { faMessage, faUserGroup } from "@fortawesome/free-solid-svg-icons";
  import ProfilePic from "./ProfilePic.svelte";
  import {
    id,
    isLoggedIn,
    login,
    pendingFriends,
    pendingPM,
  } from "../stores/settings.js";
  import axios from "axios";
  import { isEmpty } from "ramda";
  import { push } from "svelte-spa-router";

  const logout = () => {
    axios
      .post(
        `${import.meta.env.VITE_BACKEND_URI}/api/auth/logout`,
        {},
        { withCredentials: true }
      )
      .then(() => location.reload())
      .catch(console.error);
  };
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
          on:click={() => push("/pm")}
        >
          <div class="indicator">
            <Icon data={faMessage} scale={1.5} />
            {#if $pendingPM}
              <span class="badge badge-sm indicator-item badge-error"
                >{$pendingPM}</span
              >
            {/if}
          </div>
        </div>
      </div>
      <div class="dropdown dropdown-end">
        <div
          tabindex="0"
          class="btn btn-ghost btn-circle"
          on:click={() => push("/friends")}
        >
          <div class="indicator">
            <Icon data={faUserGroup} scale={1.8} />
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
