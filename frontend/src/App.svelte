<script lang="ts">
  import "./app.css";
  import Router, { push } from "svelte-spa-router";
  import routes from "./routes";

  if (new URLSearchParams(window.location.search).has("code"))
    push("/auth/oauth2callback" + window.location.search);
</script>

<Router {routes} />

<!--Dark mode style-->
<style>
  :global(body.light-mode) {
    background-color: #f2eee2;
    color: #0084f6;
    transition: background-color 0.3s;
  }
  :global(body) {
    background-color: #1d3040;
    color: #bfc2c7;
  }
</style>
