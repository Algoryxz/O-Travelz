import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/places": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/static": {
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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/leaflet")) {
            return "leaflet-vendor";
          }
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
            return "react-vendor";
          }
          if (id.includes("node_modules/lucide-react")) {
            return "lucide-vendor";
          }
          if (id.includes("node_modules/framer-motion")) {
            return "framer-vendor";
          }
          if (id.includes("src/utils/imageService")) {
            return "places-catalog";
          }
        },
      },
    },
  },
});
