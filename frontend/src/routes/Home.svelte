<script lang="ts">
  import { push } from "svelte-spa-router";
  import { onMount } from "svelte";
  import axios from "axios";
  import Pong from "../lib/Pong/Pong.svelte";
  import ChannelManager from "../lib/ChannelManager.svelte";

  const getUserData = async () =>
    axios
      .get(`${import.meta.env.VITE_BACKEND_URI}/api/user/me`, {
        withCredentials: true,
      })
      .then(({ data }) => {
        localStorage.displayname = data.displayname;
        localStorage.login = data.login;
      })
      .catch(() => push("/auth/login"));

  onMount(getUserData);
</script>

<main class="flex flex-col">
  <h1 class="m-auto text-5xl font-bold">
    {localStorage.getItem("displayname")}
  </h1>
  <button on:click={() => push("/chat")}>Chat</button>
  <ChannelManager />
  <Pong/>
</main>
