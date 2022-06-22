<script lang="ts">
    import axios from "axios";
    import {push} from "svelte-spa-router";
    import {onMount} from "svelte";

    let login: string, displayname: string, error: string, file: FileList;

    let t = 0;

    const getUserData = async () =>
        axios
            .get(`${import.meta.env.VITE_BACKEND_URI}/api/me`, {
                withCredentials: true,
            })
            .then(({ data }) => {
                localStorage.displayname = data.displayname;
                localStorage.login = data.login;
            })
            .catch(() => push("/auth/login"));

    onMount(getUserData);

    const uploadAvatar = async () => {
        const form = new FormData();
        form.append("file", file[0]);

        await axios
            .post(`${import.meta.env.VITE_BACKEND_URI}/api/me/avatar`, form, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            .then(() => t++)
            .catch((e) => {
                if (e.status !== 401) error = "Invalid file";
                else push("/");
            });
    };


</script>

<div class="grid place-items-center">
    <div class="m-auto mt-10 grid place-items-center">
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
        <br/>
        <br/>
        <button
                class="bg-gray-300 font-serif hover:bg-green-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex
            items-center border-black"
                on:click={uploadAvatar}>Submit
        </button>
    </div>
</div>
