<script>
  import ProfilePic from "./ProfilePic.svelte";
</script>

<div class="grid place-items-center py-3">
  <ProfilePic height="h-40" width="w-40" />
  <div class="font-serif grid place-items-center">
    <p class="font-bold hover:font-mono text-xl subpixel-antialiased">
      {localStorage.getItem("displayname")}
    </p>
    <p
      class="block text-lg font-medium truncate
                    font-serif antialiased"
    >
      {localStorage.getItem("login")}@student.42lausanne.ch
    </p>
  </div>
</div>
