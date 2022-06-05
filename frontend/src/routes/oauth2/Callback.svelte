<script>
  import { querystring } from "svelte-spa-router";

  window.location.search = "";

  const state = localStorage.getItem("state");
  const urlParams = new URLSearchParams($querystring);

  const code = urlParams.get("code");
  const url_state = urlParams.get("state");

  if (state === url_state) {
    fetch(`/api/oauth2/${code}`)
      .then((res) => res.json())
      .then((res) => {
        localStorage.id = res.id;
        localStorage.username = res.username;
        localStorage.avatar = res.avatar;
      })
      .then(() => (window.location.search = ""));
  }
</script>

{#if state !== url_state}
  <h1>Error: state parameters do not match</h1>
{/if}
