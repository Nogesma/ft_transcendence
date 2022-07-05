<script lang="ts">
  import ChannelManager from "../lib/ChannelManager.svelte";
  import axios from "axios";
  import { push } from "svelte-spa-router";
  import { onMount } from "svelte";
  import { login } from "../stores/settings";
  import { isNil, when } from "ramda";

  const userDataUrl = `${import.meta.env.VITE_BACKEND_URI}/api/user/me`;

  const isLoggedIn = async () =>
    axios
      .head(userDataUrl, { withCredentials: true })
      .then(() => {
        $login = true;
        when(isNil, getUserData)(localStorage.login);
      })
      .catch(() => {
        $login = false;
        push("/auth/login");
      });

  const getUserData = async () =>
    axios
      .get(userDataUrl, {
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
  else onMount(isLoggedIn);
</script>

<main class="flex flex-col">
  <h1 class="m-auto text-5xl font-bold">
    {localStorage.displayname}
  </h1>
  <ChannelManager />
</main>
