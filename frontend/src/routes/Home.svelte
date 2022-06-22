<script lang="ts">
  import { push } from "svelte-spa-router";
  import { onMount } from "svelte";
  import axios from "axios";

  let login: string, displayname: string, error: string, file: FileList;

  let t = 0;

  const getUserData = async () =>
    axios
      .get(`${import.meta.env.VITE_BACKEND_URI}/api/user/me`, {
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
    form.append("file", file[0]);

    await axios
      .post(`${import.meta.env.VITE_BACKEND_URI}/api/user/avatar`, form, {
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

<main class="flex flex-col">
  {#if login}
    <img
      class="w-80 m-auto"
      src={`${import.meta.env.VITE_WEBSERV_URI}/users/${login}.jpg?t=${t}`}
      alt="Profile"
    />
    <h1 class="m-auto text-3xl font-bold">{displayname}</h1>
  {/if}

  <h3 class="m-auto">{error ?? ""}</h3>

  <div class="m-auto mt-10">
    <label
      for="avatar_upload"
      class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
      >Choose avatar...</label
    >
    <input
      class="opacity-0"
      type="file"
      accept="image/jpeg"
      id="avatar_upload"
      bind:files={file}
    />
    <button
      class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
      on:click={uploadAvatar}>Submit</button
    >
  </div>
</main>
