<script lang="ts">
  import { push } from "svelte-spa-router";
  import { unblockUser } from "../../utils/chatManagement.js";
  import { getUserInfo } from "../../utils/info.js";
  import ProfilePic from "../../lib/ProfilePic.svelte";
  import { pick } from "ramda";
  import LeftClickMenu from "../../lib/LeftClickMenu.svelte";
  import { blocks } from "../../stores/settings.js";

  let showMenu = -1;
  let pos = { x: 0, y: 0 };
  let table: Element;

  const openMenu = (e: MouseEvent, i: number) => {
    pos = pick(["x", "y"])(e);

    if (table) {
      const bounds = table.getBoundingClientRect();
      pos.y -= bounds.y;
      pos.x -= bounds.x;
    }

    showMenu = i;
  };
</script>

<div class="gap-5 flex flex-col p-5">
  <!-- Manage mutes -->
  <table class="table table-zebra w-full">
    <thead bind:this={table}>
      <tr>
        <th colspan="6" class="text-center">Blocked</th>
      </tr>
    </thead>
    <tbody>
      {#each [...$blocks] as uid}
        {#await getUserInfo(uid) then { login, displayname, profilepicture }}
          <tr>
            <td>
              <div
                class="flex flex-row content-center place-items-center space-x-5"
              >
                <button
                  on:click|preventDefault={(e) => openMenu(e, uid)}
                  class="btn btn-ghost btn-circle avatar"
                >
                  <ProfilePic
                    attributes="h-10 w-10 rounded-full"
                    user={login}
                    def={profilepicture}
                  />
                </button>
              </div>
              {#if showMenu === uid}
                <LeftClickMenu
                  on:clickoutside={() => (showMenu = -1)}
                  {uid}
                  {pos}
                />
              {/if}
            </td>
            <td>
              <div class="italic">
                {login}
              </div>
            </td>
            <td>
              <div class="flex place-items-center">
                {displayname}
              </div>
            </td>
            <td>
              <button
                class="btn btn-primary"
                on:click={() => push(`/pm/${uid}`)}
                >Private Message
              </button>
            </td>
            <td>
              <button
                class="btn btn-primary"
                on:click={() => push(`/users/${uid}`)}>View Profile</button
              >
            </td>
            <td>
              <button class="btn btn-error" on:click={() => unblockUser(uid)}
                >Unblock</button
              >
            </td>
          </tr>
        {/await}
      {/each}
    </tbody>
  </table>
</div>
