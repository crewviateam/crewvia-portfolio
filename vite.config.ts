import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    // ─── Dev Server ────────────────────────────────────────────────────────────
    server: {
      port: 3000,
      host: true,          // Expose on LAN / ngrok
      strictPort: false,   // Fall back to next free port if 3000 is taken
      allowedHosts: true,  // Required for ngrok tunneling
      hmr: {
        clientPort: 443,   // Ngrok HTTPS tunneling
      },
    },

    // ─── Plugins ───────────────────────────────────────────────────────────────
    plugins: [
      react(),
      // NOTE: splitVendorChunkPlugin removed — conflicts with manualChunks below
    ],

    // ─── Path Aliases ──────────────────────────────────────────────────────────
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      },
    },

    // ─── Build ─────────────────────────────────────────────────────────────────
    build: {
      outDir:    'dist',
      target:    'es2020',          // Modern browsers only — smaller output
      sourcemap: !isProduction,     // No sourcemaps in production
      minify:    'terser',
      cssCodeSplit: true,           // Split CSS per-chunk for faster loading

      // Inline assets < 4KB as base64 to save network round trips
      assetsInlineLimit: 4096,

      terserOptions: {
        compress: {
          drop_console:  isProduction,
          drop_debugger: isProduction,
          passes:        2,          // Two compression passes for maximum minification
        },
        format: {
          comments: false,           // Strip all comments from production build
        },
      },

      rollupOptions: {
        output: {
          // Function form avoids conflict with splitVendorChunkPlugin
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/gsap')) {
              return 'vendor-gsap';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('node_modules/@studio-freight/lenis')) {
              return 'vendor-lenis';
            }
          },
          // Deterministic chunk names for better long-term caching
          chunkFileNames:  'assets/js/[name]-[hash].js',
          entryFileNames:  'assets/js/[name]-[hash].js',
          assetFileNames:  'assets/[ext]/[name]-[hash].[ext]',
        },
      },

      chunkSizeWarningLimit: 500, // Tighten warning threshold from 1000 to 500KB
    },

    // ─── CSS ───────────────────────────────────────────────────────────────────
    css: {
      postcss: './postcss.config.js',
      devSourcemap: !isProduction,
    },

    // ─── Removed: define: { 'process.env': env } ───────────────────────────────
    // Previously this exposed ALL environment variables to the client bundle.
    // Vite's import.meta.env handles env vars securely (only VITE_ prefixed vars).
  };
});
