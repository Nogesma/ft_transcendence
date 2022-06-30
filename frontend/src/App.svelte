<script lang="ts">
  import "./app.css";
  import Router, { push } from "svelte-spa-router";
  import routes from "./routes";
  import Navbar from "./lib/Navbar.svelte";
  // import Chat from "./lib/Chat.svelte";
  import ChannelManager from "./lib/ChannelManager.svelte";

  if (new URLSearchParams(window.location.search).has("code"))
    push("/auth/oauth2callback" + window.location.search);
</script>



<html class="dark" lang="en">
<body>
<div class="bg-white dark:bg-black">
    <Navbar />
    <Router {routes} />
    <ChannelManager />
</div>
</body>
</html>
