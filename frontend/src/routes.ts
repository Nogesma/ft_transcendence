import { wrap } from "svelte-spa-router/wrap";
import Home from "./routes/Home.svelte";

export default {
  "/": Home,
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
  "/game": wrap({
    asyncComponent: () => import("./routes/Game.svelte"),
  }),
  "*": wrap({
    asyncComponent: () => import("./routes/404.svelte"),
  }),
};
