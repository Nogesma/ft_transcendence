<script lang="ts">
  export let width: string;
  export let height: string;
  let imgURL = `/imgs/${localStorage.login}.jpg`;
</script>

<div class="{width} {height} rounded-full">
  <img
    src={imgURL}
    alt="userPFP"
    on:error={() =>
      (imgURL = `https://cdn.intra.42.fr/users/${localStorage.login}.jpg`)}
  />
</div>
