/**
 * vite-plugin-cms.ts
 *
 * Vite plugin — fetches CMS content from Supabase at build start.
 * Registered in vite.config.ts → plugins array.
 *
 * Lifecycle:
 *  configResolved  → capture the resolved Vite config (to access mode)
 *  buildStart      → fetch data → write src/data/generated/*.json
 *                    (runs for BOTH `vite build` AND `vite dev`)
 *
 * On success: logs module counts fetched from each table.
 * On failure: logs a warning, writes static fallback data, build continues.
 */

import type { Plugin, ResolvedConfig } from "vite";
import { loadEnv } from "vite";
import { fetchAndWriteCmsData, writeFallbackDataFiles } from "./src/lib/fetchCmsData";

export function cmsPlugin(): Plugin {
  let resolvedConfig: ResolvedConfig;

  return {
    name: "vite-plugin-cms",

    // ── 1. Capture resolved config so we know the build mode ────────────────
    configResolved(config) {
      resolvedConfig = config;
    },

    // ── 2. Run before any module transformation ──────────────────────────────
    async buildStart() {
      // loadEnv reads .env, .env.local, .env.[mode], .env.[mode].local
      // The third argument '' means: include ALL vars (not just VITE_ prefixed ones)
      const env = loadEnv(resolvedConfig.mode, process.cwd(), "");

      const url = env.VITE_SUPABASE_URL;
      const key = env.VITE_SUPABASE_ANON_KEY;

      const hasCredentials =
        url && key && !url.includes("your-project-ref");

      if (!hasCredentials) {
        console.warn(
          "\n[cms-plugin] ⚠  No Supabase credentials found." +
          "\n              Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local" +
          "\n              Using static fallback data instead.\n"
        );
        writeFallbackDataFiles();
        return;
      }

      try {
        await fetchAndWriteCmsData(url, key);
        console.log(
          "\n[cms-plugin] ✓ CMS data fetched from Supabase and written to src/data/generated/\n"
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(
          `\n[cms-plugin] ⚠  Supabase fetch failed: ${message}` +
          "\n              Using static fallback data instead.\n"
        );
        writeFallbackDataFiles();
      }
    },
  };
}
