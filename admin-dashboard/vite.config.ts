import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import type { Connect } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const deployHookUrl = env.VITE_DEPLOY_HOOK_URL ?? "";

  return {
    plugins: [
      react(),

      /**
       * Local-dev deploy proxy plugin.
       *
       * In production (Vercel), the admin-dashboard/api/deploy-proxy.ts
       * edge function handles POST /api/deploy-proxy server-side.
       *
       * In local dev, Vite can't run edge functions, so this plugin adds a
       * custom middleware that does the same thing: receives the POST from the
       * admin UI and forwards it to the Vercel deploy hook — server-side,
       * so there's no CORS issue.
       */
      {
        name: "local-deploy-proxy",
        configureServer(server) {
          const middleware: Connect.NextHandleFunction = async (req, res, next) => {
            if (req.method !== "POST" || req.url !== "/api/deploy-proxy") {
              return next();
            }

            // Parse body
            let body = "";
            req.on("data", (chunk: Buffer) => { body += chunk.toString(); });
            req.on("end", async () => {
              let hookUrl = "";
              try {
                const parsed = JSON.parse(body) as { hookUrl?: string };
                hookUrl = parsed.hookUrl ?? "";
              } catch {
                res.writeHead(400);
                res.end("Invalid JSON");
                return;
              }

              // Validate against configured env var
              if (!hookUrl || hookUrl !== deployHookUrl) {
                console.error("[deploy-proxy] hookUrl mismatch — rejected");
                res.writeHead(403);
                res.end("Forbidden");
                return;
              }

              // Forward to Vercel deploy hook (server-side — no CORS)
              try {
                const result = await fetch(hookUrl, { method: "POST" });
                console.log(`[deploy-proxy] ✓ Vercel hook triggered — status ${result.status}`);
                res.writeHead(result.ok ? 200 : 502, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ ok: result.ok, status: result.status }));
              } catch (err) {
                console.error("[deploy-proxy] fetch to Vercel failed:", err);
                res.writeHead(502);
                res.end("Bad Gateway");
              }
            });
          };

          server.middlewares.use(middleware);
        },
      },
    ],
  };
});
