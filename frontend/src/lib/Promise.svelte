<script>
  export let promise;
</script>

{#await promise}
  loading...
{:then data}
  {data}
{:catch error}
  {error}
{/await}
