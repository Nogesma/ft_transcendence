<script lang="ts">
  import { onMount } from "svelte";
  import { querystring, replace } from "svelte-spa-router";

  const urlParams = new URLSearchParams($querystring);
  const code = urlParams.get("code");

  if (code !== null) {
    const localState = localStorage.getItem("state");

    const state = urlParams.get("state");

    if (state !== null && state === localState)
      onMount(() => postOauth(code, localState));

    localStorage.removeItem("state");
  }

  //todo: 2fa
  const postOauth = async (c: string, s: string) => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URI}/api/oauth2/${c}/${s}`,
      {
        method: "POST",
      }
    );

    if (res.ok) {
      window.history.replaceState({}, document.title, "/");
      replace("/");
    }
  };
</script>

<h1>Callback</h1>
