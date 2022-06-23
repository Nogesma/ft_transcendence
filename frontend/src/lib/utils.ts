export const getIntraPicUrl = (ev: { target: { src: string } }) =>
  (ev.target.src =
    "https://cdn.intra.42.fr/users/" + localStorage.getItem("login") + ".jpg");
