import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !key) {
  console.error("[admin] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env.local");
}

export const supabase = createClient(url, key, {
  auth: { persistSession: true, storageKey: "crewvia-admin-session" },
});

/** Trigger a Vercel redeploy after saving CMS changes. */
export async function triggerRedeploy(): Promise<boolean> {
  const hookUrl = import.meta.env.VITE_DEPLOY_HOOK_URL as string;
  if (!hookUrl || hookUrl.includes("...")) return false;
  try {
    await fetch(hookUrl, { method: "POST" });
    return true;
  } catch {
    return false;
  }
}
