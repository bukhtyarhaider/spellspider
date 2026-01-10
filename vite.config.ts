import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import removeConsole from "vite-plugin-remove-console";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const isProduction = mode === "production";

  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
    },
    plugins: [
      react(),
      tailwindcss(),
      // Remove console logs only in production
      ...(isProduction ? [removeConsole()] : []),
    ],
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    build: {
      // Additional production optimizations
      minify: "esbuild",
      sourcemap: !isProduction,
    },
  };
});
