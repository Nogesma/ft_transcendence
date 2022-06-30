import { defineConfig, searchForWorkspaceRoot } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 8080,
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), "/imgs"],
    },
  },
});
