import Home from "./routes/Home.svelte";
import Chat from "./routes/chat/Chat.svelte";
import NotFound from "./routes/404.svelte";
import Login from "./routes/auth/Login.svelte";
import Callback from "./routes/auth/Callback.svelte";
import Authenticate2FA from "./routes/auth/TwoFactorAuth.svelte";
import Manage2FA from "./routes/settings/Manage2FA.svelte";
import ManageUserName from "./routes/settings/ManageUserName.svelte";
import Settings from "./routes/settings/Settings.svelte";
import JoinChannel from "./routes/chat/JoinChannel.svelte";

export default {
  "/": Home,
  "/chat/join": JoinChannel,
  "/settings": Settings,
  "/chat": Chat,
  "/settings/2fa": Manage2FA,
  "/settings/username": ManageUserName,
  "/auth/login": Login,
  "/auth/oauth2callback": Callback,
  "/auth/2fa": Authenticate2FA,
  "*": NotFound,
};
