<script lang="ts">
  import Router, { push } from "svelte-spa-router";
  import routes from "./routes";

  if (new URLSearchParams(window.location.search).has("code"))
    push("#/oauth2/callback" + window.location.search);
</script>

<Router {routes} />
