<script lang="ts">
  import ProfilePic from "./ProfilePic.svelte";
  import { push } from "svelte-spa-router";
  import { login } from "../stores/settings.js";

  let show = false; // menu state
  let menu: HTMLElement; // menu wrapper DOM reference

  const handleOutsideClick = (event: MouseEvent) => {
    if (!menu.contains(event.target as Node)) show = false;
  };

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") show = false;
  };
</script>

<svelte:window on:click={handleOutsideClick} on:keyup={handleEscape} />

<div class="navbar bg-base-100">
  <div class="flex-1">
    <a href="#/" class="btn btn-ghost normal-case text-xl">Transcendence</a>
  </div>
  {#if $login}
    <div class="flex-none">
      <div class="dropdown dropdown-end">
        <div tabindex="0" class="btn btn-ghost btn-circle avatar">
          <div class="w-10 rounded-full">
            <ProfilePic height="h-10" width="w-10" />
          </div>
        </div>
        <ul
          tabindex="0"
          class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li>
            <button on:click={() => push("/settings")}
              >{localStorage.login}@student.42lausanne.ch</button
            >
          </li>
          <li><button on:click={() => push("/logout")}>Logout</button></li>
        </ul>
      </div>
    </div>
  {/if}
</div>
