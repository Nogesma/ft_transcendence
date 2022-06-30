<script>
  import Pong from "./Pong.svelte";

  function handleKeydown() {}

  function handleKeyup() {}
</script>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />

<div>
  <Pong width={500} height={250} />
</div>
