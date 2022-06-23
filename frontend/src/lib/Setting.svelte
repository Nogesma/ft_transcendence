<script lang="ts">
  import axios from "axios";
  import { push } from "svelte-spa-router";

  let error: string, file: FileList;

  let t = 0;

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
      .then(() => t++) // todo: find a way to update avatar in <Profile />
      .catch((e) => {
        if (e.status !== 401) error = "Invalid file";
        else push("/");
      });
  };
</script>

<div class="grid place-items-center">
  <div class="m-auto mt-10 grid place-items-center">
    <h3>{error ?? ""}</h3>
    <label
      for="avatar_upload"
      class="bg-gray-300 font-serif hover:bg-green-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex
            items-center border-black"
    >
      Upload avatar
    </label>
    <input
      class="opacity-0"
      type="file"
      accept="image/jpeg"
      id="avatar_upload"
      bind:files={file}
    />
    <br />
    <br />
    <button
      class="bg-gray-300 font-serif hover:bg-green-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex
            items-center border-black"
      on:click={uploadAvatar}
      >Submit
    </button>
  </div>
</div>
