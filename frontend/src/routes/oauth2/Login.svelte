<script lang="ts">
  import { nanoid } from "nanoid";

  const client_id = encodeURIComponent(import.meta.env.VITE_CLIENT_ID);
  const redirect_uri = encodeURIComponent(import.meta.env.VITE_REDIRECT_URI);
  const state = nanoid();
  const response_type = "code";
  const scope = "public";

  localStorage.setItem("state", state);

  const request_string = `https://api.intra.42.fr/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&state=${state}&response_type=${response_type}`;
</script>

<a href={request_string}>Login with 42!</a>
