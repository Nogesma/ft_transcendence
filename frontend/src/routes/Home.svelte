<script lang="ts">
  import ChannelManager from "../lib/ChannelManager.svelte";
  import axios from "axios";
  import { push } from "svelte-spa-router";
  import { onMount } from "svelte";
  import { login } from "../stores/settings";

  const authenticate = async () =>
    axios
      .get(`${import.meta.env.VITE_BACKEND_URI}/api/user/me`, {
        withCredentials: true,
      })
      .then(({ data }) => {
        localStorage.displayname = data.displayname;
        localStorage.login = data.login;
        $login = true;
      })
      .catch(() => {
        $login = false;
        push("/auth/login");
      });

  if (new URLSearchParams(window.location.search).has("code"))
    push("/auth/oauth2callback" + window.location.search);
  else onMount(authenticate);
</script>

<main class="flex flex-col">
  <h1 class="m-auto text-5xl font-bold">
    {localStorage.displayname}
  </h1>
  <ChannelManager />
</main>
