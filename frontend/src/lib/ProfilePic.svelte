<script lang="ts">
  import axios from "axios";
  import { onMount } from "svelte";
  export let attributes: string;
  // todo: maybe protect from xss in username?
  export let user = localStorage.login;
  const hasCustomPFP = async () =>
    axios
      .head(`/imgs/${user}.jpg`)
      .then(() => (imgURL = `/imgs/${user}.jpg`))
      .catch(() => (imgURL = `https://cdn.intra.42.fr/users/${user}.jpg`));
  let imgURL: string;
  onMount(hasCustomPFP);
</script>

<img src={imgURL} class={attributes} alt="userPFP" />
