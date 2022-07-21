<script lang="ts">
  import "./app.css";
  import Router, { push } from "svelte-spa-router";
  import routes from "./routes";
  import Navbar from "./lib/Navbar.svelte";
  import { onMount } from "svelte";
  import { statusSocket } from "./utils/socket";
  import { checkAuthentication } from "./utils/auth";
  import { id, status } from "./stores/settings";
  import type { Socket } from "socket.io-client";

  if (new URLSearchParams(window.location.search).has("code"))
    push("/auth/oauth2callback" + window.location.search);
  else onMount(checkAuthentication);

  let socket: Socket | null;

  $: if ($id !== 0) socket = statusSocket();

  $: socket && socket.emit("status", { status: $status });
</script>

<div>
  <Navbar />
  <Router {routes} />
</div>
