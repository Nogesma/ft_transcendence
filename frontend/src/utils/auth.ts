import axios from "axios";
import { push } from "svelte-spa-router";
import { displayname, id, isLoggedIn, login } from "../stores/settings";

const userDataUrl = `${import.meta.env.VITE_BACKEND_URI}/api/user/me`;

const checkAuthentication = async () =>
  axios
    .head(userDataUrl, { withCredentials: true })
    .then(() => {
      getUserData();
    })
    .catch(() => {
      isLoggedIn.set(false);
      push("/auth/login");
    });

const getUserData = async () =>
  axios
    .get(userDataUrl, {
      withCredentials: true,
    })
    .then(({ data }) => {
      displayname.set(data.displayname);
      login.set(data.login);
      id.set(data.id);
      isLoggedIn.set(true);
    })
    .catch(() => {
      isLoggedIn.set(false);
      push("/auth/login");
    });

export { getUserData, checkAuthentication };
