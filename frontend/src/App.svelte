<script lang="ts">
  import "./app.css";
  import Router, { push } from "svelte-spa-router";
  import routes from "./routes";
  import Navbar from "./lib/Navbar.svelte";
  import { onMount } from "svelte";
  import { checkAuthentication } from "./utils/auth";
  import { gameId, pmSocket, status } from "./stores/settings";
  import { initPM } from "./utils/pm";

  $: $pmSocket.emit("status", { status: $status, gameId: $gameId });

  if (new URLSearchParams(window.location.search).has("code")) {
    push("/auth/oauth2callback" + window.location.search);
  } else
    onMount(() => {
      checkAuthentication();
      initPM($pmSocket);
    });
</script>

<div class="h-screen flex flex-col">
  <Navbar />
  <Router {routes} />
</div>
