<script lang="ts">
  import { querystring, replace } from "svelte-spa-router";
  import axios from "axios";
  import { equals } from "ramda";
  import { onMount } from "svelte";
  import TFAInput from "../../lib/2faInput.svelte";
  import { checkAuthentication } from "../../utils/auth";

  const urlParams = new URLSearchParams($querystring);
  const code = urlParams.get("code");

  const redirect = () => {
    checkAuthentication();
    window.history.replaceState({}, document.title, "/");
    replace("/");
  };

  if (code) {
    const localState = localStorage.getItem("state");
    localStorage.removeItem("state");

    const state = urlParams.get("state");

    if (state && state === localState)
      onMount(() => postOauth(code, localState));
    else redirect();
  } else redirect();

  const teapot = axios.create({
    validateStatus: equals(418),
  });

  const postOauth = async (c: string, s: string) =>
    teapot
      .post(
        `${import.meta.env.VITE_BACKEND_URI}/api/auth/oauth2/${c}/${s}`,
        {},
        { withCredentials: true }
      )
      .then(() => {
        (<HTMLInputElement>document.getElementById("enter-2fa")).checked = true;
      })
      .catch(redirect);
</script>

<input type="checkbox" id="enter-2fa" class="modal-toggle" />
<div class="modal">
  <div class="modal-box">
    <div class="flex flex-col">
      <h3 class="text-lg font-bold pb-4">Enter 2FA Code</h3>
      <TFAInput modalId="enter-2fa" url="api/auth/2fa" />
    </div>
  </div>
</div>
