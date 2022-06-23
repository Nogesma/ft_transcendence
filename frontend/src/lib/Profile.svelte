<div class="grid place-items-center py-3">
  <img
    class="w-40 h-40 rounded-full object-cover
            border border-b-gray-100 shadow-sm"
    src={`${import.meta.env.VITE_WEBSERV_URI}/users/${localStorage.getItem(
      "login"
    )}.jpg`}
    alt="userPFP"
  />
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
