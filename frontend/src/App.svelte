<script lang="ts">
  import "./app.css";
  import Router from "svelte-spa-router";
  import routes from "./routes";
  import Navbar from "./lib/Navbar.svelte";
</script>

<html class="dark" lang="en">
  <body>
    <div class="bg-white dark:bg-black">
      <Navbar />
      <Router {routes} />
    </div>
  </body>
</html>
