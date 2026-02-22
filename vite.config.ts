import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: Number(process.env.FRONTEND_PORT) || 5173,
    watch: {
      usePolling: true,
    },
    proxy: {
      "/socket.io": {
        target: `http://${process.env.BACKEND_HOST || "backend"}:${process.env.BACKEND_PORT || "3001"}`,
        changeOrigin: true,
        ws: true,
      },
      "/api": {
        target: `http://${process.env.BACKEND_HOST || "backend"}:${process.env.BACKEND_PORT || "3001"}`,
        changeOrigin: true,
      },
    },
  },
});
