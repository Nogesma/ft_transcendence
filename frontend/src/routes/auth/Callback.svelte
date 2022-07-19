<script lang="ts">
  import { querystring, replace } from "svelte-spa-router";
  import axios from "axios";
  import { equals } from "ramda";
  import { onMount } from "svelte";
  import TFAInput from "../../lib/2faInput.svelte";
  import Modal from "../../lib/Modal.svelte";
  import { getUserData } from "../../utils/auth";

  const urlParams = new URLSearchParams($querystring);
  const code = urlParams.get("code");

  if (code) {
    const localState = localStorage.getItem("state");
    localStorage.removeItem("state");

    const state = urlParams.get("state");

    if (state && state === localState)
      onMount(() => postOauth(code, localState));
  }

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
        const modal: HTMLInputElement = <HTMLInputElement>(
          document.getElementById("enter-2fa")
        );

        modal.checked = true;
      })
      .catch(() => {
        getUserData();
        window.history.replaceState({}, document.title, "/");
        replace("/");
      });
</script>

<Modal id="enter-2fa">
  <svelte:fragment slot="content">
    <div class="flex flex-col">
      <h3 class="text-lg font-bold pb-4">Enable 2FA</h3>
      <TFAInput modalId="enter-2fa" url="api/auth/2fa" />
    </div>
  </svelte:fragment>
</Modal>
