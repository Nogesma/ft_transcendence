import { wrap } from "svelte-spa-router/wrap";
import Home from "./routes/Home.svelte";
import NotFound from "./routes/404.svelte";

export default {
  "/": Home,
  "/users/:profileId": wrap({
    asyncComponent: () => import("./routes/users/Profile.svelte"),
  }),
  "/users/:historyId/history": wrap({
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
  "/game/:gameId?": wrap({
    asyncComponent: () => import("./routes/Game.svelte"),
  }),
  "/chat/:channelName?": wrap({
    asyncComponent: () => import("./routes/FSChat.svelte"),
  }),
  "/pm/:pmId?": wrap({
    asyncComponent: () => import("./routes/PrivateMessage.svelte"),
  }),
  "/admin/chat/:adminChannel?": wrap({
    asyncComponent: () => import("./routes/admin/Channel.svelte"),
  }),
  // "/admin/block": wrap({
  //   asyncComponent: () => import("./routes/.svelte"),
  // }),
  "*": NotFound,
};
