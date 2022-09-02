import { wrap } from "svelte-spa-router/wrap";
import Home from "./routes/Home.svelte";

export default {
  "/": Home,
  "/users/:id": wrap({
    asyncComponent: () => import("./routes/users/Profile.svelte"),
  }),
  "/users/:id/history": wrap({
    asyncComponent: () => import("./routes/users/MatchHistory.svelte"),
  }),
  "/friends": wrap({
    asyncComponent: () => import("./routes/Friend.svelte"),
  }),
  "/auth/login": wrap({
    asyncComponent: () => import("./routes/auth/Login.svelte"),
  }),
  "/auth/oauth2callback": wrap({
    asyncComponent: () => import("./routes/auth/Callback.svelte"),
  }),
  "/game/:id?": wrap({
    asyncComponent: () => import("./routes/Game.svelte"),
  }),
  "/chat/:id?": wrap({
    asyncComponent: () => import("./routes/FSChat.svelte"),
  }),
  "*": wrap({
    asyncComponent: () => import("./routes/404.svelte"),
  }),
};
