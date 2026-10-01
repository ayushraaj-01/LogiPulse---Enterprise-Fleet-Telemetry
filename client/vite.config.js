import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    target: "esnext",
    minify: "esbuild",
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          leaflet: ["leaflet"],
          icons: ["lucide-react"],
          socket: ["socket.io-client"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5050",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:5050",
        ws: true,
      },
    },
  },
});
