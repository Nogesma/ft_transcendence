import Home from "./routes/Home.svelte";
import NotFound from "./routes/404.svelte";
import Login from "./routes/auth/Login.svelte";
import Callback from "./routes/auth/Callback.svelte";
import Authenticate2FA from "./routes/auth/TwoFactorAuth.svelte";
import Manage2FA from "./routes/settings/Manage2FA.svelte";

export default {
  "/": Home,
  "/settings/2fa": Manage2FA,
  "/auth/login": Login,
  "/auth/oauth2callback": Callback,
  "/auth/2fa": Authenticate2FA,
  "*": NotFound,
};
