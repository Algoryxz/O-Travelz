import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/places": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/itinerary": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/ai": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/map": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/transport": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/health": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
});
