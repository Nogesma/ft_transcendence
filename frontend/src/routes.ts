import { wrap } from "svelte-spa-router/wrap";
import Home from "./routes/Home.svelte";

export default {
  "/": Home,
  "/settings": wrap({
    asyncComponent: () => import("./routes/settings/Settings.svelte"),
  }),
  "/users/:id": wrap({
    asyncComponent: () => import("./routes/users/Profile.svelte"),
  }),
  "/users/history/:id": wrap({
    asyncComponent: () => import("./routes/users/MatchHistory.svelte"),
  }),
  "/auth/login": wrap({
    asyncComponent: () => import("./routes/auth/Login.svelte"),
  }),
  "/auth/oauth2callback": wrap({
    asyncComponent: () => import("./routes/auth/Callback.svelte"),
  }),
  "/auth/2fa": wrap({
    asyncComponent: () => import("./routes/auth/TwoFactorAuth.svelte"),
  }),
  "*": wrap({
    asyncComponent: () => import("./routes/404.svelte"),
  }),
};
