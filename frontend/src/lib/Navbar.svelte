<script lang="ts">
  import ProfilePic from "./ProfilePic.svelte";
  import { id, isLoggedIn, login } from "../stores/settings.js";
  import axios from "axios";

  const logout = () => {
    axios
      .post(
        `${import.meta.env.VITE_BACKEND_URI}/api/auth/logout`,
        {},
        { withCredentials: true }
      )
      .then(() => location.reload());
  };
</script>

<div class="navbar bg-base-100">
  <div class="flex-1">
    <a href="#/" class="btn btn-ghost normal-case text-xl">Transcendence</a>
  </div>
  {#if $isLoggedIn}
    <div class="flex-none">
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
