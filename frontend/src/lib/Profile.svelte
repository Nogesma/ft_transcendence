<script>
  import ProfilePic from "./ProfilePic.svelte";
</script>

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content flex-col lg:flex-row">
    <ProfilePic attributes="max-w-sm rounded-lg shadow-2xl" />
    <div>
      <h1 class="text-5xl font-bold">Box Office News!</h1>
      <p class="py-6">
        Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
        excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a
        id nisi.
      </p>
      <button class="btn btn-primary">Match History</button>
    </div>
  </div>
</div>

<!--<div class="grid place-items-center py-3">-->
<!--  <ProfilePic height="h-40" width="w-40" />-->
<!--  <div class="font-serif grid place-items-center">-->
<!--    <p class="font-bold hover:font-mono text-xl subpixel-antialiased">-->
<!--      {localStorage.getItem("displayname")}-->
<!--    </p>-->
<!--    <p-->
<!--      class="block text-lg font-medium truncate-->
<!--                    font-serif antialiased"-->
<!--    >-->
<!--      {localStorage.getItem("login")}@student.42lausanne.ch-->
<!--    </p>-->
<!--  </div>-->
<!--</div>-->
