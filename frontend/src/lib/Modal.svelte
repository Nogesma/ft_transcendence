<script lang="ts">
  export let id: string;
  export let modalElement: HTMLElement | undefined = undefined;
  export let inputElement: HTMLElement | undefined = undefined;
</script>

<input bind:this={inputElement} type="checkbox" {id} class="modal-toggle" />
<label bind:this={modalElement} for={id} class="modal cursor-pointer">
  <!-- Give a for attribute with no meaning to the label to remove warnings -->
  <label class="modal-box relative" for="no-id">
    <slot name="content" />
  </label>
</label>
