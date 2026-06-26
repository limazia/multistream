import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    open: true,
    port: 5173,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/shared/components"),
      "@utils": path.resolve(__dirname, "./src/shared/utils"),
      "@lib": path.resolve(__dirname, "./src/shared/lib"),
      "@hooks": path.resolve(__dirname, "./src/shared/hooks"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@schemas": path.resolve(__dirname, "./src/shared/schemas"),
    },
  },
});
