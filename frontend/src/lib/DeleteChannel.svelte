<script lang="ts">
    import axios from "axios";

    let channelPublic = true;
    let channelName: string;

    const deleteChannel = () =>
        axios
            .post(
                `${import.meta.env.VITE_BACKEND_URI}/api/chat/delete/${channelName}`,
                {
                    password: channelPassword,
                    public: channelPublic,
                },
                {
                    withCredentials: true,
                }
            )
            .then(({ data }) => console.log(data))
            .catch();

    // Clear password when type changes
    $: channelPassword = "" && channelPublic;
</script>

<label for="delete-modal" class="modal-button btn">Delete Channel</label>

<!-- Put this part before </body> tag -->
<input type="checkbox" id="delete-modal" class="modal-toggle" />
<label for="delete-modal" class="modal cursor-pointer">
    <label class="modal-box relative" for="">
        <label
                for="delete-modal"
                class="btn btn-sm btn-circle absolute right-2 top-2">✕</label
        >
        <h3 class="text-lg font-bold">Delete channel</h3>
        <div class="form-control">
            <label class="input-group">
                <span>Name</span>
                <input
                        bind:value={channelName}
                        type="text"
                        placeholder=""
                        class="input input-bordered"
                />
            </label>
        </div>
        <div class="form-control">
            <label class="label cursor-pointer">
                <span class="label-text">Public channel</span>
                <input
                        type="checkbox"
                        bind:checked={channelPublic}
                        class="toggle toggle-primary"
                />
            </label>
        </div>
        {#if !channelPublic}
            <div class="form-control">
                <label class="input-group">
                    <span>Password</span>
                    <input
                            bind:value={channelPassword}
                            type="password"
                            placeholder=""
                            class="input input-bordered"
                    />
                </label>
            </div>
        {/if}
        <div class="modal-action">
            <label
                    for="delete-modal"
                    class="btn btn-active btn-primary"
                    on:click={deleteChannel}>Delete</label
            >
        </div>
    </label>
</label>
