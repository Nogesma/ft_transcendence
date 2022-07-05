<script lang="ts">
  import axios from "axios";
  import { onMount } from "svelte";

  export let width: string;
  export let height: string;

  const hasCustomPFP = async () =>
    axios
      .head(`/imgs/${localStorage.login}.jpg`)
      .then(() => (imgURL = `/imgs/${localStorage.login}.jpg`))
      .catch(
        () =>
          (imgURL = `https://cdn.intra.42.fr/users/${localStorage.login}.jpg`)
      );

  let imgURL: string;

  onMount(hasCustomPFP);
</script>

<div class="{width} {height} rounded-full">
  <img src={imgURL} alt="userPFP" />
</div>
