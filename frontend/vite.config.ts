import { defineConfig, searchForWorkspaceRoot } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import viteCompression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
    target: "es2022",
  },
  plugins: [
    svelte(),
    viteCompression({
      filter: /\.(js|mjs|json|css|html|wasm|svg|map)$/i,
      algorithm: "brotliCompress",
    }),
    viteCompression({
      filter: /\.(js|mjs|json|css|html|wasm|svg|map)$/i,
      algorithm: "gzip",
    }),
  ],
  server: {
    port: 8080,
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), "/imgs"],
    },
  },
});
