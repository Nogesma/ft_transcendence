import Home from "./routes/Home.svelte";
import NotFound from "./routes/404.svelte";
import Login from "./routes/auth/Login.svelte";
import Callback from "./routes/auth/Callback.svelte";
import TFA from "./routes/auth/TwoFactorAuth.svelte";

export default {
  "/": Home,
  "/auth/login": Login,
  "/auth/oauth2callback": Callback,
  "/auth/2fa": TFA,
  "*": NotFound,
};
