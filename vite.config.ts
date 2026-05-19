import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cmsPlugin } from "./vite-plugin-cms";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    // ─── Root ──────────────────────────────────────────────────────────────────
    // Vite resolves imports relative to root. Setting root to project root (default)
    // and using src/ as the source directory via explicit paths.

    // ─── Dev Server ────────────────────────────────────────────────────────────
    server: {
      port: 3000,
      host: true,
      strictPort: false,
      allowedHosts: true,
      hmr: {
        clientPort: 443,
      },
    },

    // ─── Plugins ───────────────────────────────────────────────────────────────
    plugins: [
      cmsPlugin(),   // runs first — writes src/data/generated/*.json before transforms
      react(),
    ],

    // ─── Path Aliases ──────────────────────────────────────────────────────────
    resolve: {
      alias: {
        // '@' now resolves to src/ — matches tsconfig paths
        "@": path.resolve(__dirname, "./src"),
      },
    },

    // ─── Build ─────────────────────────────────────────────────────────────────
    build: {
      outDir:       "dist",
      target:       "es2020",
      sourcemap:    !isProduction,
      minify:       "terser",
      cssCodeSplit: true,

      // Inline small assets as base64 (saves round trips for icons/tiny images)
      assetsInlineLimit: 4096,

      terserOptions: {
        compress: {
          drop_console:  isProduction,
          drop_debugger: isProduction,
          passes:        2,
        },
        format: {
          comments: false,
        },
      },

      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
              return "vendor-react";
            }
            if (id.includes("node_modules/gsap")) {
              return "vendor-gsap";
            }
            if (id.includes("node_modules/lucide-react")) {
              return "vendor-icons";
            }
            if (id.includes("node_modules/@studio-freight/lenis")) {
              return "vendor-lenis";
            }
          },
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
        },
      },

      chunkSizeWarningLimit: 500,
    },

    // ─── CSS ───────────────────────────────────────────────────────────────────
    css: {
      devSourcemap: !isProduction,
    },
  };
});
