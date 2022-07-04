<script lang="ts">
  import penguin from "../assets/Penguins.png";
  import ProfilePic from "./ProfilePic.svelte";
  import { push } from "svelte-spa-router";
  import { scale } from "svelte/transition";
  // import Chat from "./Chat.svelte";

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

<nav class="bg-white border-gray-300 px-10 sm:px-10 py-2.5 dark:bg-gray-900 ">
  <div class="container flex flex-wrap justify-between items-center mx-auto">
    <a href="#/" class="flex items-center">
      <img src={penguin} class="mr-3 h-6 sm:h-9" alt="Logo" />
      <span
        class="self-center text-xl font-semi-bold whitespace-nowrap dark:text-white"
        >penguins</span
      >
    </a>
    <div class="flex items-center md:order-2">
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
                  {localStorage.displayname}
                </a>
                <span
                  class="block text-sm font-medium truncate dark:text-gray-400"
                  >{localStorage.login}@student.42lausanne.ch</span
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
