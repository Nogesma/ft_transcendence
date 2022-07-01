<script lang="ts">
  import { push, querystring, replace } from "svelte-spa-router";
  import axios from "axios";
  import { equals } from "ramda";
  import { onMount } from "svelte";

  const urlParams = new URLSearchParams($querystring);
  const code = urlParams.get("code");

  if (code) {
    const localState = localStorage.getItem("state");

    const state = urlParams.get("state");

    if (state && state === localState)
      onMount(() => postOauth(code, localState));

    localStorage.removeItem("state");
  }

  const teapot = axios.create({
    validateStatus: equals(418),
  });

  const postOauth = async (c: string, s: string) =>
    teapot
      .post(
        `${import.meta.env.VITE_BACKEND_URI}/api/auth/oauth2/${c}/${s}`,
        {},
        { withCredentials: true }
      )
      .then(() => push("#/auth/2fa"))
      .catch(() => {
        window.history.replaceState({}, document.title, "/");
        replace("/");
      });
</script>

<h1>Callback</h1>
