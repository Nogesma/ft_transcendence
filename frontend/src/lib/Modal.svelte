<script lang="ts">
  export let id: string;
</script>

<input type="checkbox" {id} class="modal-toggle" />
<label for={id} class="modal cursor-pointer">
  <!-- Give a for attribute with no meaning to the label to remove warnings -->
  <label class="modal-box relative" for="no-id">
    <slot name="content" />
  </label>
</label>
