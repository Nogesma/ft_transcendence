<script lang="ts">
  import penguin from "../assets/Penguins.png";
  import ProfilePic from "./ProfilePic.svelte";
  import { push } from "svelte-spa-router";
  import { scale } from "svelte/transition";

  let show = false; // menu state
  let menu: HTMLElement; // menu wrapper DOM reference

  const handleOutsideClick = (event: MouseEvent) => {
    console.log(typeof Event);
    if (!menu.contains(event.target as Node)) show = false;
  };

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") show = false;
  };

  // Dark mode toggle
  let modeC: string;
  let mode = false;
  function toggle() {
    window.document.body.classList.toggle("light-mode");
    mode = !mode;
    !mode ? (modeC = "green") : (modeC = "gray");
  }
  !mode ? (modeC = "green") : (modeC = "gray");
</script>

<svelte:window on:click={handleOutsideClick} on:keyup={handleEscape} />

<nav class="bg-white border-gray-300 px-10 sm:px-10 py-2.5 dark:bg-gray-900">
  <div class="container flex flex-wrap justify-between items-center mx-auto">
    <a href="#/" class="flex items-center">
      <img src={penguin} class="mr-3 h-6 sm:h-9" alt="Logo" />
      <span
        class="self-center text-xl font-semibold whitespace-nowrap dark:text-white"
        >penguins</span
      >
    </a>
    <div class="flex items-center md:order-2">
      <label class="swap swap-rotate">
        <input type="checkbox" on:click={toggle} />
<!--        Dont care about these garbages they're doing their stuffs-->
        <svg class="mx-2 swap-on fill-current w-10 h-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/></svg>
        <svg class="mx-2 swap-off fill-current w-10 h-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"/></svg>
      </label>
      <div class="relative" bind:this={menu}>
        <div>
          <button
            on:click={() => (show = !show)}
            class="flex mr-3 text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4
                                    focus:ring-gray-300 dark:focus:ring-gray-600"
            id="user-menu-button"
            aria-expanded="false"
            type="button"
          >
            <ProfilePic height="h-10" width="w-10" />
          </button>
          {#if show}
            <div
              class="origin-top-right absolute right-0.5 w-60 py-3 mt-3 bg-gray-800 rounded shadow-md z-50
                                    my-4 text-base list-none bg-white rounded divide-gray-100 shadow
                                    dark:bg-gray-700 dark:divide-gray-600 px-4"
              in:scale={{ duration: 100, start: 0.95 }}
              out:scale={{ duration: 75, start: 0.95 }}
            >
              <div
                class="z-50 my-4 text-base list-none bg-white rounded divide-y divide-gray-100
                                        shadow dark:bg-gray-700 dark:divide-gray-600"
              >
                <a
                  href="#/settings"
                  class="block text-sm text-gray-900 dark:text-white"
                >
                  {localStorage.getItem("displayname")}
                </a>
                <span
                  class="block text-sm font-medium text-{modeC}-500
                                truncate dark:text-gray-400"
                  >{localStorage.getItem("login")}@student.42lausanne.ch</span
                >
              </div>
              <button
                on:click={() => push("/logout")}
                class="block text-sm text-gray-900 dark:text-white"
                type="button"
              >
                Logout
              </button>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</nav>
