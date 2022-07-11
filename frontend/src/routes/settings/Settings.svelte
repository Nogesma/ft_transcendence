<script>
  import Profile from "../users/Profile.svelte";
  import Setting from "../../lib/Setting.svelte";
</script>

<Profile params={{ id: localStorage.id }} />
<Setting />
