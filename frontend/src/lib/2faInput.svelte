<script lang="ts">
  import axios from "axios";
  import { replace } from "svelte-spa-router";
  import { getUserData } from "../utils/auth";
  import { isEmpty } from "ramda";

  export let url: string;
  export let modalId: string;
  export let successMessage = "";

  let code: string,
    error = "",
    success = false;

  const post2FA = async () => {
    const input = <HTMLInputElement>document.getElementById("2fa-input");

    if (input.validity.valid) {
      axios
        .post(
          `${import.meta.env.VITE_BACKEND_URI}/${url}/${code}`,
          {},
          { withCredentials: true }
        )
        .then(() => {
          success = true;
          getUserData();
          if (isEmpty(successMessage)) {
            (<HTMLInputElement>document.getElementById(modalId)).checked =
              false;
            window.history.replaceState({}, document.title, "/");
            replace("/");
          }
        })
        .catch(({ response }) => {
          error = response.data.message;
          code = "";
        });
    } else {
      error = "Invalid input";
      code = "";
    }
  };
</script>

{#if !success}
  {#if !isEmpty(error)}
    <div class="alert alert-error shadow-lg mb-2">
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current flex-shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          /></svg
        >
        <span>{error}</span>
      </div>
    </div>
  {/if}
  <label class="input-group">
    <span>Code</span>

    <input
      id="2fa-input"
      size="6"
      maxlength="6"
      minlength="6"
      pattern="\d*"
      required
      inputmode="numeric"
      title="Only enter numbers"
      class="input input-bordered flex-auto"
      bind:value={code}
    />
  </label>
{:else}
  <div class="alert alert-success shadow-lg">
    <div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="stroke-current flex-shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        /></svg
      >
      <span>{successMessage}</span>
    </div>
  </div>
{/if}

<div class="modal-action">
  {#if success}
    <label for={modalId} class="btn btn-active btn-primary">OK</label>
  {:else}
    <div class="btn btn-active btn-primary" on:click={post2FA}>Send</div>
  {/if}
</div>
