<script lang="ts">
  import "./app.css";
  import Router from "svelte-spa-router";
  import routes from "./routes";
  import Navbar from "./lib/Navbar.svelte";
</script>

<div>
  <Navbar />
  <Router {routes} />
</div>
