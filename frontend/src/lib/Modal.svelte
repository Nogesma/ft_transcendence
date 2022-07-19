<script lang="ts">
  export let id: string;
</script>

<input type="checkbox" {id} class="modal-toggle" />
<label for={id} class="modal cursor-pointer">
  <label class="modal-box relative" for={id}>
    <label for={id} class="btn btn-sm btn-circle absolute right-2 top-2"
      >✕</label
    >
    <slot name="content" />
  </label>
</label>
