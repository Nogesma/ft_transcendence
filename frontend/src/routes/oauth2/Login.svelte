<script>
  import { nanoid } from "nanoid";

  const client_id =
    "ba3d391399909e1abe4166962a096cbc7c4f8bb9c55a66e764d63fac14521ffc";
  const redirect_uri = "http://localhost:3000/";
  const scope = "public";
  const state = nanoid();
  const response_type = "code";

  localStorage.setItem("state", state);

  const request_string = `https://api.intra.42.fr/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}&state=${state}&response_type=${response_type}`;
</script>

<a href={request_string}>Login with 42!</a>
