import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";
import mkcert from "vite-plugin-mkcert";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8080,
    https: true,
  },
  define: {
    // eslint-disable-next-line no-undef
    "process.env": process.env,
  },
  plugins: [react(), mkcert()],
  resolve: {
    alias: {
      src: path.resolve(__dirname, "src"),
      assets: path.resolve(__dirname, "src/assets"),
    },
  },
});
