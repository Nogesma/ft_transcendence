<script lang="ts">
  import "./app.css";
  import Router, { push } from "svelte-spa-router";
  import routes from "./routes";

  if (new URLSearchParams(window.location.search).has("code"))
    push("/auth/oauth2callback" + window.location.search);
</script>

<Router {routes} />
