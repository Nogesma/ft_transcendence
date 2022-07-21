<script lang="ts">
  import axios from "axios";
  import { login } from "../stores/settings";
  import { pfp } from "../stores/settings.js";
  import { always, cond, equals, T } from "ramda";

  export let attributes: string;
  // todo: maybe protect from xss in username?
  export let user: string;
  export let status = -1;

  const getProfilePicture = async (u: string) =>
    axios
      .head(`/imgs/${u}.jpg`)
      .then(() => `/imgs/${u}.jpg`)
      .catch(() => `https://cdn.intra.42.fr/users/${u}.jpg`);

  // typescript hack because it can't find the type of pfp and img src needs to be a string
  let img: string;
  $: img = $pfp as string;

  const fn = cond<[number], string>([
    [equals(1), always("badge-success")],
    [equals(2), always("badge-error")],
    [T, always("")],
  ]);

  const colour = fn(status);
</script>

<div class={status !== -1 ? "indicator" : ""}>
  {#if status !== -1}
    <span class="indicator-item indicator-bottom badge {colour}" />
  {/if}
  {#if user === $login}
    <img src={img} class={attributes} alt="userPFP" />
  {:else}
    {#await getProfilePicture(user) then url}
      <img src={url} class={attributes} alt="userPFP" />
    {/await}
  {/if}
</div>
