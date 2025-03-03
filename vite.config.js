import react from "@vitejs/plugin-react";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

// Define __dirname manually for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  root: "./src",
  base: "./",
  envPrefix: "VITE_",

  plugins: [react()],

  // server: {
  //   proxy: {
  //     "/upload": {
  //       target: "...",
  //       changeOrigin: true,
  //       secure: false,
  //       rewrite: (path) => path.replace(/^\/upload/, "/upload"),
  //     },
  //   },
  // },

  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        charset: false,
      },
    },
  },

  build: {
    outDir: "../dist",
    assetsDir: "./",
    assetsInlineLimit: 4096,
    emptyOutDir: true,
    target: "es2015",

    rollupOptions: {
      input: {
        main: resolve(__dirname, "./src/main.jsx"),
      },
      output: {
        manualChunks: undefined,
        assetFileNames: ({ name }) => {
          if (/\.(gif|jpe?g|png|svg)$/.test(name ?? "")) {
            return `[name][extname]`;
          }
          return "[name]-[hash][extname]";
        },
      },
    },
  },
});