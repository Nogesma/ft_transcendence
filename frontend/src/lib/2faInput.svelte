<script lang="ts">
  import { replace } from "svelte-spa-router";
  import axios from "axios";

  export let url: string;

  let s: string;
  let error: string = "";

  const post2FA = async () =>
    axios
      .post(
        `${import.meta.env.VITE_BACKEND_URI}/${url}/${s}`,
        {},
        { withCredentials: true }
      )
      .then(() => {
        window.history.replaceState({}, document.title, "/");
        replace("/");
      })
      .catch(() => {
        error = "Wrong 2FA Code";
        s = "";
      });
</script>

<h1>2FA</h1>

<h3>{error}</h3>

<form on:submit|preventDefault={post2FA} class="container">
  <input
    size="6"
    maxlength="6"
    minlength="6"
    pattern="\d*"
    required
    on:keydown={() => (error = "")}
    inputmode="numeric"
    title="Only enter numbers"
    bind:value={s}
  />
  <br />
  <input type="submit" value="Submit" />
</form>

<style>
  h3 {
    font-size: 60px;
    text-align: center;
    color: #ff3e00;
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  input {
    font-size: 60px;
    text-align: center;
  }
</style>
