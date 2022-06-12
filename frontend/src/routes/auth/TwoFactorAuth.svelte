<script lang="ts">
  import { replace } from "svelte-spa-router";

  let s: string;
  let error: string = "";

  const post2FA = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URI}/api/auth/2fa/${s}`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (res.ok) {
      window.history.replaceState({}, document.title, "/");
      replace("/");
    } else {
      error = "Wrong 2FA Code";
      s = "";
    }
  };
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
