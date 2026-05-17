import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      "/speed": {
        target: "https://speed.cloudflare.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/speed/, "")
      }
    }
  }
});
