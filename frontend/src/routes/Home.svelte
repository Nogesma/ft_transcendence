<script lang="ts">
  import { push } from "svelte-spa-router";
  import { onMount } from "svelte";
  import axios from "axios";

  let login: string, displayname: string;

  let file,
    error,
    t = 0;

  const getUserData = async () =>
    axios
      .get(`${import.meta.env.VITE_BACKEND_URI}/api/me`, {
        withCredentials: true,
      })
      .then(({ data }) => {
        displayname = data.displayname;
        login = data.login;
      })
      .catch(() => push("/auth/login"));

  onMount(getUserData);

  const uploadAvatar = async () => {
    const form = new FormData();
    form.append("size", file[0].size);
    /* Other parts */
    form.append("file", file[0]);
    form.append("mimeType", file[0].mimeType);

    console.log(file);
    console.log(file.size);
    await axios
      .post(`${import.meta.env.VITE_BACKEND_URI}/api/me/avatar`, form, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => t++)
      .catch((e) => {
        if (e.status != 401) error = "Invalid file";
        else push("/");
      });
  };
</script>

<main>
  {#if login}
    <img
      src={`${import.meta.env.VITE_WEBSERV_URI}/users/${login}.jpg?t=${t}`}
      alt="Profile picture"
    />
    <h1>{displayname}</h1>
  {/if}

  <h3>{error ?? ""}</h3>
  <input type="file" accept="image/jpeg" bind:files={file} />
  <button on:click={uploadAvatar}>Submit</button>
</main>

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }

  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
  }

  img {
    height: 16rem;
  }
</style>
