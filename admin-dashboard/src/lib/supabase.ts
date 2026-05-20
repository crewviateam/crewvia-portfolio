import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !key) {
  console.error("[admin] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env.local");
}

export const supabase = createClient(url, key, {
  auth: { persistSession: true, storageKey: "crewvia-admin-session" },
});

/**
 * Trigger a Vercel redeploy after saving CMS changes.
 *
 * WHY a proxy route:
 *  Calling api.vercel.com directly from the browser fails with a CORS error
 *  because Vercel's deploy hook endpoint doesn't include Access-Control-Allow-Origin.
 *  We proxy through our own Vite dev server (/api/deploy-proxy) to avoid this.
 *  In production (Vercel), the same /api/deploy-proxy edge function handles it
 *  server-side, so CORS is never an issue.
 */
export async function triggerRedeploy(): Promise<boolean> {
  const hookUrl = import.meta.env.VITE_DEPLOY_HOOK_URL as string;

  if (!hookUrl || hookUrl.includes("your-hook") || hookUrl.includes("prj_PLACEHOLDER")) {
    console.warn("[admin] VITE_DEPLOY_HOOK_URL not configured — skipping redeploy trigger");
    return false;
  }

  console.log("[admin] Triggering Vercel redeploy via proxy...");

  try {
    // Use our proxy endpoint so the request is server-side (no CORS issue)
    const res = await fetch("/api/deploy-proxy", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ hookUrl }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[admin] Deploy proxy responded ${res.status}:`, text);
      return false;
    }

    console.log("[admin] ✓ Redeploy triggered successfully");
    return true;
  } catch (err) {
    console.error("[admin] Deploy proxy fetch failed:", err);
    return false;
  }
}
