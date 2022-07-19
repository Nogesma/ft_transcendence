<script lang="ts">
  import axios from "axios";
  import { replace } from "svelte-spa-router";
  import { getUserData } from "../utils/auth";

  export let url: string;
  export let modalId: string;
  let s: string;
  let error = "";

  const post2FA = async () =>
    axios
      .post(
        `${import.meta.env.VITE_BACKEND_URI}/${url}/${s}`,
        {},
        { withCredentials: true }
      )
      .then(() => {
        getUserData();
        window.history.replaceState({}, document.title, "/");
        replace("/");
      })
      .catch(() => {
        error = "Wrong 2FA Code";
        s = "";
      });
</script>

<label class="input-group">
  <span>Code</span>

  <input
    size="6"
    maxlength="6"
    minlength="6"
    pattern="\d*"
    required
    on:keydown={() => (error = "")}
    inputmode="numeric"
    title="Only enter numbers"
    class="input input-bordered flex-auto"
    bind:value={s}
  />
</label>
<!-- todo: dont close the modal immediatly, display a success/error message -->
<div class="modal-action">
  <label for={modalId} class="btn btn-active btn-primary" on:click={post2FA}
    >Send</label
  >
</div>
