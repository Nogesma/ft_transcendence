<script lang="ts">
  import "./app.css";
  import Router, { push } from "svelte-spa-router";
  import routes from "./routes";
  import Navbar from "./lib/Navbar.svelte";
  import { onMount } from "svelte";
  import { checkAuthentication } from "./utils/auth";

  if (new URLSearchParams(window.location.search).has("code"))
    push("/auth/oauth2callback" + window.location.search);
  else onMount(checkAuthentication);
</script>

<div>
  <Navbar />
  <Router {routes} />
</div>
