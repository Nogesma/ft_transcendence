<script>
  export let width = 10;
  export let height = 10;
  let imgURL = `/imgs/${localStorage.getItem("login")}.jpg`;
</script>

<img
  class="w-{width} h-{height} rounded-full object-cover border border-b-gray-100 shadow-sm"
  src={imgURL}
  alt="userPFP"
  on:error={() =>
    (imgURL = `https://cdn.intra.42.fr/users/${localStorage.getItem(
      "login"
    )}.jpg`)}
/>
