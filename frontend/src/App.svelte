<script>
  import Router, { push } from "svelte-spa-router";
  import routes from "./routes";

  // Redirect to manage oauth2 callback if url has code parameter
  if (new URLSearchParams(window.location.search).has("code"))
    push("#/oauth2/callback" + window.location.search);
</script>

<Router {routes} />
