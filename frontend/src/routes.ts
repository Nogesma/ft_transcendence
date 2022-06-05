import Home from "./routes/Home.svelte";
import NotFound from "./routes/404.svelte";
import Login from "./routes/oauth2/Login.svelte";

export default {
  "/": Home,
  "/oauth2/login": Login,
  "*": NotFound,
};
