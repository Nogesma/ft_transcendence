<script lang="ts">
  import axios from "axios";
  import { login } from "../stores/settings";
  import { pfp } from "../stores/settings.js";
  import { always, cond, equals, T } from "ramda";
  import fallbackProfilePicture from "../assets/rick.jpg";

  export let attributes: string;
  // todo: maybe protect from xss in username?
  export let user: string;
  export let status = -1;

  const getProfilePicture = async (u: string) =>
    axios
      .head(`/imgs/${u}.jpg`)
      .then(() => `/imgs/${u}.jpg`)
      .catch(() => `https://cdn.intra.42.fr/users/${u}.jpg`);

  let img: string | Promise<string>;
  // typescript hack because it can't find the type of pfp and img src needs to be a string
  $: img = user === $login ? ($pfp as string) : getProfilePicture(user);

  const getStatus = cond<[number], [string, string]>([
    [equals(1), always(["badge-success", "Online"])],
    [equals(2), always(["badge-error", "Playing"])],
    [equals(3), always(["badge-primary", "Spectating"])],
    [T, always(["", "Offline"])],
  ]);

  const [colour, text] = getStatus(status);

  $: console.log(img);
</script>

<div class={status !== -1 ? "indicator" : ""}>
  {#if status !== -1}
    <span class="has-tooltip indicator-item indicator-bottom badge {colour}">
      <span
        class="custom-tooltip rounded shadow-lg bg-base-300 p-2 mt-16 text-white"
        >{text}</span
      >
    </span>
  {/if}
  {#await img then src}
    <img
      {src}
      class={attributes}
      alt="userPFP"
      on:error={() => (img = fallbackProfilePicture)}
    />
  {/await}
</div>
