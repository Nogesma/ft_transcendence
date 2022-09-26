<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import { push } from "svelte-spa-router";

  export let pos = { x: 0, y: 0 };
  export let id = 0;
  export let displayname = "";
  export let userLogin = "";
  export let banUser: (userLogin: string) => void;
  export let muteUser: (userLogin: string) => void;

  const dispatch = createEventDispatcher();

  let menu: HTMLElement;
  const onPageClick = (e: MouseEvent) => {
    if (e.target === menu || menu.contains(e.target as Node)) return;
    dispatch("clickoutside");
  };

  $: () => {
    if (!menu) return;

    const rect = menu.getBoundingClientRect();
    pos.x = Math.min(window.innerWidth - rect.width, pos.x);
    if (pos.y > window.innerHeight - rect.height) pos.y -= rect.height;
  };

  let admin = true; //todo: if user is admin

  const blockUser = (id: number) => {
    id;
  }; //todo
</script>

<svelte:body on:click={onPageClick} />

<div
  id="main"
  transition:fade={{ duration: 100 }}
  bind:this={menu}
  style="top: {pos.y}px; left: {pos.x}px;"
>
  <div class="elem text-gray-50" on:click={() => push(`/users/${id}`)}>
    View profile
  </div>
  <div class="elem text-red-600" on:click={() => blockUser(id)}>
    Block {displayname}
  </div>

  {#if admin}
    <li class="elem text-red-600" on:click={() => banUser(userLogin)}>
      Ban {displayname}
    </li>
    <li class="elem text-red-600" on:click={() => muteUser(userLogin)}>
      Mute {displayname}
    </li>
  {/if}
</div>

<style>
  div#main {
    position: absolute;
    display: grid;
    border: 1px solid #0003;
    box-shadow: 2px 2px 5px 0px #0002;
    background: white;
  }

  div.elem {
    padding: 4px 15px;
    cursor: default;
    font-size: 14px;
    display: flex;
    align-items: center;
    grid-gap: 5px;
  }
  div.elem:hover {
    background: #0002;
  }
</style>
