<script lang="ts">
  import axios from "axios";
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";

  dayjs.extend(relativeTime);
  import ProfilePic from "../../lib/ProfilePic.svelte";

  export let params: { id: number };

  const id = params.id;

  const getUserMatchHistory = () =>
    axios
      .get(`${import.meta.env.VITE_BACKEND_URI}/api/info/game/history/${id}`, {
        withCredentials: true,
      })
      .then(({ data }) => data);
</script>

{#await getUserMatchHistory()}
  ...
{:then matches}
  <table class="table table-zebra w-full">
    <thead>
      <tr>
        <th colspan="5" class="text-center">Match History</th>
      </tr>
    </thead>
    <tbody>
      {#each matches as { login: opponentLogin, displayname: opponentDisplayname, win, playerElo, opponentElo, playerScore, opponentScore, date }}
        <tr>
          <td class="text-xs text-center">
            <i>{playerElo}</i>
            {playerScore >= 0 ? `+${playerScore}` : playerScore}
          </td>
          <td>
            <div class="flex content-center">
              <div class="avatar px-5">
                <div class="w-10 h-10">
                  <ProfilePic attributes="rounded-full" />
                </div>
              </div>
              <div class="flex place-items-center">
                {localStorage.displayname}
              </div>
            </div>
          </td>
          <td class="text-center">
            {win ? "VICTORY" : "DEFEAT"}<br />
            <div class="tooltip" data-tip={dayjs(date).format()}>
              {dayjs(date).fromNow()}
            </div>
          </td>
          <td>
            <div class="flex content-center flex-row-reverse">
              <div class="avatar px-5">
                <div class="w-10 h-10">
                  <ProfilePic attributes="rounded-full" user={opponentLogin} />
                </div>
              </div>
              <div class="flex place-items-center">
                {opponentDisplayname}
              </div>
            </div>
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