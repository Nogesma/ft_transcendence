<script lang="ts">
  import { push } from "svelte-spa-router";
  import { onMount } from "svelte";
  import axios from "axios";
  import Navbar from "../lib/Navbar.svelte";

  const getUserData = async () =>
    axios
      .get(`${import.meta.env.VITE_BACKEND_URI}/api/user/me`, {
        withCredentials: true,
      })
      .then(({ data }) => {
        localStorage.displayname = data.displayname;
        localStorage.login = data.login;
      })
      .catch(() => push("/auth/login"));

  onMount(getUserData);
</script>

<header>
  <Navbar />
</header>
<main class="flex flex-col">
  <h1 class="m-auto text-5xl font-bold">
    {localStorage.getItem("displayname")}
  </h1>

  <!--    <h3 class="m-auto">{error ?? ""}</h3>-->

  <!--    <div class="m-auto mt-10">-->
  <!--      <label-->
  <!--        for="avatar_upload"-->
  <!--        class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"-->
  <!--      >-->
  <!--        Choose avatar...-->
  <!--      </label>-->
  <!--      <input-->
  <!--        class="opacity-0"-->
  <!--        type="file"-->
  <!--        accept="image/jpeg"-->
  <!--        id="avatar_upload"-->
  <!--        bind:files={file}-->
  <!--      />-->
  <!--      <button-->
  <!--        class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-centers"-->
  <!--        on:click={uploadAvatar}>Submit-->
  <!--      </button>-->
  <!--    </div>-->
</main>
