<script lang="ts">
  import { push } from "svelte-spa-router";
  import { onMount } from "svelte";

  let displayName: string, profilePicture: string;

  const getUserData = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URI}/api/me`, {
      credentials: "include",
    });

    if (res.ok) {
      const json = await res.json();
      displayName = json.displayname;
      profilePicture = json.image_url;
    } else await push("#/auth/login");
  };

  onMount(getUserData);
</script>

<main>
  <img src={profilePicture} alt="Svelte Logo" />
  <h1>{displayName}</h1>
</main>

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }

  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
  }

  img {
    height: 16rem;
  }
</style>
