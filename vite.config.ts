import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.png"],
      manifest: {
        name: "Das Gemeinwohl IPTV",
        short_name: "GemeinwohlTV",
        description: "Streaming for the Common Good",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        icons: [
          {
            src: "icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  build: {
    // Raise warning limit — we're intentionally splitting, so large chunks
    // in individual vendor files are expected and cached separately.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core — smallest, most frequently cached chunk
          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/react-dom")
          ) {
            return "vendor-react";
          }
          // React Router — navigation, changes rarely
          if (
            id.includes("node_modules/react-router") ||
            id.includes("node_modules/@remix-run")
          ) {
            return "vendor-router";
          }
          // HLS.js — heavy media library, only used in LivePlayer
          if (id.includes("node_modules/hls.js")) {
            return "vendor-hls";
          }
          // i18n / translations — loaded once, rarely changes
          if (
            id.includes("node_modules/i18next") ||
            id.includes("node_modules/react-i18next")
          ) {
            return "vendor-i18n";
          }
          // UI utilities — clsx, tailwind-merge, lucide-react
          if (
            id.includes("node_modules/clsx") ||
            id.includes("node_modules/tailwind-merge") ||
            id.includes("node_modules/lucide-react")
          ) {
            return "vendor-ui";
          }
          // Zustand state management
          if (id.includes("node_modules/zustand")) {
            return "vendor-state";
          }
        },
      },
    },
  },
});
