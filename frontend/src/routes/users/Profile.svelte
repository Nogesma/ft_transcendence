<script lang="ts">
  import ProfilePic from "../../lib/ProfilePic.svelte";
  import axios from "axios";
  import { push } from "svelte-spa-router";

  export let params: { id: number };

  const id = params?.id ?? localStorage.id;

  const getUserStats = () =>
    axios
      .get(`${import.meta.env.VITE_BACKEND_URI}/api/info/${id}`, {
        withCredentials: true,
      })
      .then(({ data }) => data)
      .catch(console.error);
</script>

{#await getUserStats()}
  ...
{:then { login, displayname, win, losses, elo, highestElo }}
  <div class="hero min-h-screen bg-base-200">
    <div class="hero-content flex-col lg:flex-row justify-start w-full">
      <ProfilePic attributes="max-w-sm rounded-lg shadow-2xl" user={login} />
      <div class="flex flex-col ml-6 space-y-6 content-start">
        <h1 class="text-5xl font-bold">{displayname}</h1>
        <div class="flex flex-row space-x-4">
          <table class="table table-zebra w-full flex-auto">
            <thead>
              <tr>
                <th>Win</th>
                <th>Loss</th>
                <th>Ratio (%)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{win}</td>
                <td>{losses}</td>
                <td>{losses !== 0 ? (win / losses) * 100 : 100}%</td>
              </tr>
            </tbody>
          </table>
          <table class="table table-zebra w-full flex-auto">
            <thead>
              <tr>
                <th>Current Elo</th>
                <th>Highest Elo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{elo}</td>
                <td>{highestElo}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <button
          class="btn btn-primary"
          on:click={() => push(`/users/history/${id}`)}>Match History</button
        >
      </div>
    </div>
  </div>
{/await}
<!--<div class="grid place-items-center py-3">-->
<!--  <ProfilePic height="h-40" width="w-40" />-->
<!--  <div class="font-serif grid place-items-center">-->
<!--    <p class="font-bold hover:font-mono text-xl subpixel-antialiased">-->
<!--      {localStorage.getItem("displayname")}-->
<!--    </p>-->
<!--    <p-->
<!--      class="block text-lg font-medium truncate-->
<!--                    font-serif antialiased"-->
<!--    >-->
<!--      {localStorage.getItem("login")}@student.42lausanne.ch-->
<!--    </p>-->
<!--  </div>-->
<!--</div>-->
