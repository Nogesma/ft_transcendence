<script lang="ts">
  import "./app.css";
  import Router, { push } from "svelte-spa-router";
  import routes from "./routes";
  import Navbar from "./lib/Navbar.svelte";
  import { onMount } from "svelte";
  import { checkAuthentication } from "./utils/auth";
  import {
    blocks,
    friends,
    gameId,
    id,
    pendingFriends,
    pmSocket,
    status,
  } from "./stores/settings";
  import { initPM } from "./utils/pm";
  import {
    getBlockList,
    getFriendList,
    getPendingFriendRequests,
  } from "./utils/friend";

  $: $pmSocket.emit("status", { status: $status, gameId: $gameId });

  if (new URLSearchParams(window.location.search).has("code")) {
    push("/auth/oauth2callback" + window.location.search);
  } else
    onMount(async () => {
      await checkAuthentication();
    });

  const initValues = async () => {
    $friends = new Set<number>(await getFriendList());
    $blocks = new Set<number>(await getBlockList());
    $pendingFriends = new Set<number>(await getPendingFriendRequests());
    initPM($pmSocket);
  };

  $: if ($id !== 0) initValues();
</script>

<div class="h-screen flex flex-col">
  <Navbar />
  <Router {routes} />
</div>
