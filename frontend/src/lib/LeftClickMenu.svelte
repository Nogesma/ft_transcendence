<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import { id } from "../stores/settings";

  import { getUserInfo } from "../utils/info.js";
  import ProfilePic from "./ProfilePic.svelte";
  import { push } from "svelte-spa-router";

  export let pos = { x: 0, y: 0 };
  export let uid = 0;
  export let dir = true;

  let isClick = 0;

  const dispatch = createEventDispatcher();

  let menu: HTMLElement;
  const onPageClick = (e: MouseEvent) => {
    if (!isClick) {
      isClick++;
      return;
    }
    if (e.target === menu || menu.contains(e.target as Node)) return;
    dispatch("clickoutside");
  };

  $: () => {
    if (!menu) return;

    const rect = menu.getBoundingClientRect();
    pos.x = Math.min(window.innerWidth - rect.width, pos.x);
    if (pos.y > window.innerHeight - rect.height) pos.y -= rect.height;
  };
</script>

<svelte:body on:click={onPageClick} />

{#if uid}
  <div
    bind:this={menu}
    style="top: {pos.y}px; {dir
      ? `left: ${pos.x}px;`
      : `right: ${window.innerWidth - pos.x}px`}"
    class="card card-side bg-base-100 shadow absolute z-50"
    transition:fade={{ duration: 100 }}
  >
    {#await getUserInfo(uid) then { login, displayname, status }}
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
