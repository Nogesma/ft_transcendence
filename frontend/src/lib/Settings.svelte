<script lang="ts">
  import Modal from "./Modal.svelte";
  import {
    request2FA,
    updateUserName,
    uploadAvatar,
    resetAvatar,
    getTFAStatus,
  } from "../utils/settings";
  import { displayname, updatepfp } from "../stores/settings.js";
  import TFAInput from "./2faInput.svelte";
  import { push } from "svelte-spa-router";

  let elem: HTMLElement;
  let file: FileList;
  let name: string;
</script>

{#await getTFAStatus() then tfa_enabled}
  <h1 class="text-5xl font-bold">Settings</h1>
  <div class="flex flex-row space-x-4">
    <label for="change-displayname" class="btn btn-primary modal-button"
      >Change display name</label
    >
    <label for="change-avatar" class="btn btn-primary modal-button"
      >Change Avatar</label
    >
    <label
      for="toggle-2fa"
      class="btn btn-primary modal-button"
      on:click={() => request2FA(tfa_enabled, elem)}
      on:keypress={() => request2FA(tfa_enabled, elem)}
      >{tfa_enabled ? "Disable" : "Enable"} 2FA</label
    >
    <button class="btn btn-primary" on:click={() => push("/admin/block")}
      >Manage blocks</button
    >
  </div>

  <Modal id="change-displayname">
    <svelte:fragment slot="content">
      <div class="flex flex-col">
        <h3 class="text-lg font-bold pb-4">Change display name</h3>
        <label class="input-group">
          <span>Name</span>
          <input
            bind:value={name}
            type="text"
            size="28"
            placeholder={$displayname}
            class="input input-bordered flex-auto"
          />
        </label>
        <div class="modal-action">
          <label
            for="change-displayname"
            class="btn btn-active btn-primary"
            on:click={() => updateUserName(name)}
            on:keypress={() => updateUserName(name)}>Modify</label
          >
        </div>
      </div>
    </svelte:fragment>
  </Modal>

  <Modal id="change-avatar">
    <svelte:fragment slot="content">
      <div class="flex flex-col">
        <h3 class="text-lg font-bold pb-4">Change avatar</h3>
        <label class="input-group">
          <input
            type="file"
            accept="image/jpeg"
            id="avatar_upload"
            bind:files={file}
          />
        </label>
        <div class="modal-action">
          <label
            for="change-avatar"
            class="btn btn-active btn-primary"
            on:click={() => resetAvatar(updatepfp)}
            on:keypress={() => resetAvatar(updatepfp)}>Reset avatar</label
          >
        </div>
        <div class="modal-action">
          <label
            for="change-avatar"
            class="btn btn-active btn-primary"
            on:click={() => uploadAvatar(file, updatepfp)}
            on:keypress={() => uploadAvatar(file, updatepfp)}>Upload</label
          >
        </div>
      </div>
    </svelte:fragment>
  </Modal>

  <Modal id="toggle-2fa">
    <svelte:fragment slot="content">
      <div class="flex flex-col">
        {#if tfa_enabled}
          <h3 class="text-lg font-bold pb-4">Disable 2FA</h3>

          <TFAInput
            modalId="toggle-2fa"
            url="api/user/2fa/disable"
            successMessage="TFA has been disabled"
          />
        {:else}
          <h3 class="text-lg font-bold pb-4">Enable 2FA</h3>

          <div class="flex flex-auto justify-center mb-5" bind:this={elem} />
          <TFAInput
            modalId="toggle-2fa"
            url="api/user/2fa/validate"
            successMessage="2FA has been enabled"
          />
        {/if}
      </div>
    </svelte:fragment>
  </Modal>
{/await}
