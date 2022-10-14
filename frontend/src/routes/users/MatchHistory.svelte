<script lang="ts">
  import axios from "axios";
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";

  dayjs.extend(relativeTime);
  import ProfilePic from "../../lib/ProfilePic.svelte";
  import { displayname, id, login } from "../../stores/settings.js";
  import { getUserInfo } from "../../utils/info";
  import { pick } from "ramda";
  import LeftClickMenu from "../../lib/LeftClickMenu.svelte";

  export let params: { id: number };

  const uid: number = params?.id ?? $id;

  const getUserMatchHistory = () =>
    axios
      .get(`${import.meta.env.VITE_BACKEND_URI}/api/info/game/history/${uid}`, {
        withCredentials: true,
      })
      .then(({ data }) => data)
      .catch(console.error);

  let ulogin: string, udisplayname: string;

  if (uid == $id) [ulogin, udisplayname] = [$login, $displayname];
  else
    getUserInfo(uid).then(
      ({ login, displayname }) =>
        ([ulogin, udisplayname] = [login, displayname])
    );

  let showMenu = "";
  let pos = { x: 0, y: 0 };
  let table: Element;

  const openMenu = (e: MouseEvent, i: string, dir: boolean) => {
    pos = pick(["x", "y"])(e);
    if (table) {
      // We need to subtract thead height because the menu position is absolute.
      const bounds = table.getBoundingClientRect();
      console.log(bounds);
      pos.y -= bounds.y;
      pos.x = dir ? pos.x - bounds.x : pos.x + bounds.x;
    }
    showMenu = i;
  };
</script>

<div class="p-5">
  {#await getUserMatchHistory() then matches}
    <table class="table table-zebra w-full">
      <thead bind:this={table}>
        <tr>
          <th colspan="5" class="text-center">Match History</th>
        </tr>
      </thead>
      <tbody>
        {#each matches as { login: opponentLogin, displayname: opponentDisplayname, opponentId, win, playerElo, opponentElo, playerScore, opponentScore, date }, i}
          <tr>
            <td class="text-xs text-center">
              <i>{playerElo}</i>
              {playerScore >= 0 ? `+${playerScore}` : playerScore}
            </td>
            <td>
              <div class="flex content-center">
                <button
                  on:click|preventDefault={(e) => openMenu(e, `${i}.0`, true)}
                  class="btn btn-ghost btn-circle avatar"
                >
                  <ProfilePic attributes="rounded-full" user={ulogin} />
                </button>

                <div class="flex place-items-center pl-5">
                  {udisplayname}
                </div>
              </div>
              {#if showMenu === `${i}.0`}
                <LeftClickMenu
                  on:clickoutside={() => (showMenu = "")}
                  {uid}
                  {pos}
                />
              {/if}
            </td>
            <td class="text-center {win ? 'text-green-500' : 'text-red-600'}">
              {win ? "VICTORY" : "DEFEAT"}<br />
              <div class="tooltip" data-tip={dayjs(date).format()}>
                {dayjs(date).fromNow()}
              </div>
            </td>
            <td>
              <div class="flex content-center flex-row-reverse">
                <button
                  on:click|preventDefault={(e) => openMenu(e, `${i}.1`, false)}
                  class="btn btn-ghost btn-circle avatar"
                >
                  <ProfilePic
                    attributes="h-10 w-10 rounded-full"
                    user={opponentLogin}
                  />
                </button>

                <div class="flex place-items-center pr-5">
                  {opponentDisplayname}
                </div>
              </div>
              {#if showMenu === `${i}.1`}
                <LeftClickMenu
                  on:clickoutside={() => (showMenu = "")}
                  uid={opponentId}
                  {pos}
                  dir={false}
                />
              {/if}
            </td>
            <td class="text-xs text-center">
              <i>{opponentElo}</i>
              {opponentScore >= 0 ? `+${opponentScore}` : opponentScore}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/await}
</div>
