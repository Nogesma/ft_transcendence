// Components
import Home from "./routes/Home.svelte";
import Name from "./routes/Name.svelte";
import NotFound from "./routes/404.svelte";
import Login from "./routes/oauth2/Login.svelte";
import Callback from "./routes/oauth2/Callback.svelte";

export default {
  "/": Home,
  "/hello/:first/:last?": Name,

  "/oauth2/login": Login,
  "/oauth2/callback": Callback,
  // Wildcard parameter
  // Included twice to match both `/wild` (and nothing after) and `/wild/*` (with anything after)
  // "/wild": Wild,
  // "/wild/*": Wild,

  // Catch-all, must be last
  "*": NotFound,
};
