<script lang="ts">
  import { replace } from "svelte-spa-router";
  import TFAInput from "../../lib/2faInput.svelte";
</script>

<TFAInput url="api/auth/2fa" callback />
