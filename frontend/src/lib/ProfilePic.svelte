<script lang="ts">
  export let width: string;
  export let height: string;
  let imgURL = `/imgs/${localStorage.login}.jpg`;
</script>
<img
  class="{width} {height} rounded-full object-cover border border-b-gray-100 shadow-sm"
  src={imgURL}
  alt="userPFP"
  on:error={() =>
    (imgURL = `https://cdn.intra.42.fr/users/${localStorage.login}.jpg`)}
/>
