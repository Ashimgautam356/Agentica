import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      proxy: {
        "/api": {
          target:
            env.VITE_API_PROXY_TARGET ||
            process.env.VITE_API_PROXY_TARGET ||
            "http://localhost:4000",
          changeOrigin: true,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            charts: ["recharts"],
            vendor: ["react", "react-dom", "react-router-dom", "@tanstack/react-query"],
            icons: ["@remixicon/react"],
          },
        },
      },
    },
  };
});
