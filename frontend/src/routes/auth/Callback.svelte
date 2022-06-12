<script lang="ts">
  import { onMount } from "svelte";
  import { push, querystring, replace } from "svelte-spa-router";

  const urlParams = new URLSearchParams($querystring);
  const code = urlParams.get("code");

  if (code !== null) {
    const localState = localStorage.getItem("state");

    const state = urlParams.get("state");

    if (state !== null && state === localState)
      onMount(() => postOauth(code, localState));

    localStorage.removeItem("state");
  }

  const postOauth = async (c: string, s: string) => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URI}/api/auth/oauth2/${c}/${s}`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (res.status == 418) {
      push("#/auth/2fa");
    } else {
      window.history.replaceState({}, document.title, "/");
      replace("/");
    }
  };
</script>

<h1>Callback</h1>
