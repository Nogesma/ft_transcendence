import { wrap } from "svelte-spa-router/wrap";
import Home from "./routes/Home.svelte";
import Authenticate2FA from "./routes/auth/TwoFactorAuth.svelte";
import Manage2FA from "./routes/settings/Manage2FA.svelte";
import ManageUserName from "./routes/settings/ManageUserName.svelte";

export default {
  "/": Home,
  "/settings": wrap({
    asyncComponent: () => import("./routes/settings/Settings.svelte"),
  }),
  "/settings/2fa": Manage2FA,
  "/settings/username": ManageUserName,
  "/auth/login": wrap({
    asyncComponent: () => import("./routes/auth/Login.svelte"),
  }),
  "/auth/oauth2callback": wrap({
    asyncComponent: () => import("./routes/auth/Callback.svelte"),
  }),
  "/auth/2fa": Authenticate2FA,
  "*": wrap({
    asyncComponent: () => import("./routes/404.svelte"),
  }),
};
