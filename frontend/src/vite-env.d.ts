/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REDIRECT_URI: string;
  readonly VITE_BACKEND_URI: string;
  readonly VITE_CLIENT_ID: string;
  readonly VITE_WEBSOCKET_URI: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
