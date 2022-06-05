<script lang="ts">
  import { onMount } from "svelte";
  import Router from "svelte-spa-router";
  import routes from "./routes";

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");

  if (code !== null) {
    const localState = localStorage.getItem("state");
    // window.location.search = "";

    const state = urlParams.get("state");

    if (state !== null && state === localState)
      onMount(() => postOauth(code, localState));

    localStorage.removeItem("state");
  }

  const postOauth = async (c: string, s: string) => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URI}/api/oauth2/${c}/${s}`,
      {
        method: "POST",
      }
    );
    console.log("resok: ", res.ok);

    if (res.ok) {
      const json = await res.json();
      console.log("json:", json);
      localStorage.setItem("token", json.accessToken);
    }
  };
</script>

<Router {routes} />
