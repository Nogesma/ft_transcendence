<script lang="ts">
  import Router, { push } from "svelte-spa-router";
  import routes from "./routes";
  import { onMount } from "svelte";

  if (new URLSearchParams(window.location.search).has("code"))
    push("#/oauth2/callback" + window.location.search);

  let displayName, profilePicture;

  const getUserData = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URI}/api/me`);

    if (res.ok) {
      const json = await res.json();
      displayName = json.displayName;
      profilePicture = json.profilePicture;
    } else await push("#/oauth2/login");
  };

  onMount(getUserData);
</script>

<Router {routes} />
