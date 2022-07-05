<script lang="ts">
  import { nanoid } from "nanoid";

  const client_id = encodeURIComponent(import.meta.env.VITE_CLIENT_ID);
  const redirect_uri = encodeURIComponent(import.meta.env.VITE_REDIRECT_URI);
  const state = nanoid();
  const response_type = "code";
  const scope = "public";

  localStorage.setItem("state", state);

  const oauthUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&state=${state}&response_type=${response_type}`;
</script>

<div class="hero min-h-screen">
  <div class="hero-content text-center">
    <div>
      <h1 class="text-5xl font-bold pb-40">Login with 42 !</h1>
      <a class="btn btn-active btn-primary btn-lg" href={oauthUrl}>Log in</a>
    </div>
  </div>
</div>
