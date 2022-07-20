<script lang="ts">
  import axios from "axios";
  import { login } from "../stores/settings";
  import { pfp } from "../stores/settings.js";
  export let attributes: string;
  // todo: maybe protect from xss in username?
  export let user: string;

  const getProfilePicture = async (u: string) =>
    axios
      .head(`/imgs/${u}.jpg`)
      .then(() => `/imgs/${u}.jpg`)
      .catch(() => `https://cdn.intra.42.fr/users/${u}.jpg`);

  // typescript hack because it can't find the type of pfp and img src needs to be a string
  let img: string;
  $: img = $pfp as string;
</script>

{#if user === $login}
  <img src={img} class={attributes} alt="userPFP" />
{:else}
  {#await getProfilePicture(user) then url}
    <img src={url} class={attributes} alt="userPFP" />
  {/await}
{/if}
