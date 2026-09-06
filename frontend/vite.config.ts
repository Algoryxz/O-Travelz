import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { execSync } from "child_process";

let detectedSha = "593d20263bc3b2442fe3f9ef12dffaefde17b74b";
try {
  detectedSha = process.env.VITE_BUILD_SHA || execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
} catch {
  // fallback to base sha
}

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "./",
  define: {
    "import.meta.env.VITE_BUILD_SHA": JSON.stringify(process.env.VITE_BUILD_SHA || detectedSha),
    "import.meta.env.VITE_BUILD_TIME": JSON.stringify(new Date().toISOString()),
  },
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
      "/weather": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/auth": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/location": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/health": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/images": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      "/places": { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/api": { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/static": { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/itinerary": { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/ai": { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/map": { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/transport": { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/weather": { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/auth": { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/location": { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/health": { target: "http://127.0.0.1:8000", changeOrigin: true },
      "/images": { target: "http://127.0.0.1:8000", changeOrigin: true },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/leaflet")) {
            return "leaflet-vendor";
          }
          if (id.includes("node_modules/maplibre-gl")) {
            return "maplibre-vendor";
          }
          if (id.includes("node_modules/three") || id.includes("node_modules/@mkkellogg/gaussian-splats-3d")) {
            return "three-vendor";
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
