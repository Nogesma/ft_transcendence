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

  // change username
  let s: string;

  const updateUserName = async () =>
    axios
      .post(
              `${import.meta.env.VITE_BACKEND_URI}/api/user/name`,
              {name: s},
              {
                withCredentials: true,
              }
      )
      .then(() => push("/"))
      .catch();

</script>

<div class="grid place-items-center">
  <div class="m-auto mt-10">
    <h3>{error ?? ""}</h3>
    <div class="change_user grid place-items-center">
      <form on:submit|preventDefault={updateUserName} class="m-1 grid place-items-center">
        <input class="input input-bordered input-success w-full max-w-xs" size="28" required bind:value={s} />
        <input type="submit" value="change username" class="btn bg-gray-300 font-serif hover:bg-green-400 text-gray-800 font-bold m-1.5" />
      </form>
    </div>
    <div class="change_avatar grid place-items-center my-4">
      <label
              for="avatar_upload"
              class="bg-gray-300 font-serif hover:bg-green-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex
                    border-green-500"
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
      <button
              class="bg-gray-300 font-serif hover:bg-green-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex
            items-center border-black"
              on:click={uploadAvatar}
      >Submit
      </button>
    </div>
  </div>
</div>
