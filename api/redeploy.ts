/**
 * api/redeploy.ts — Vercel Edge Function
 *
 * Triggered by a Supabase Database Webhook when content tables are modified.
 * Calls the Vercel Deploy Hook to trigger an automatic rebuild of the portfolio,
 * so the build-time CMS data fetch picks up the new content.
 *
 * Setup in Supabase:
 *  Dashboard → Database → Webhooks → Create a new webhook:
 *    Name:    "portfolio-redeploy"
 *    Table:   projects (repeat for services, team_members, process_steps, site_content)
 *    Events:  INSERT, UPDATE, DELETE
 *    URL:     https://crewvia.in/api/redeploy
 *    Headers: { "x-webhook-secret": "<your-secret>" }  ← add to WEBHOOK_SECRET env var
 *
 * Setup in Vercel:
 *  Dashboard → Project → Settings → Git → Deploy Hooks
 *  Create hook named "cms-content-update" on the main branch.
 *  Copy the hook URL → add as VERCEL_DEPLOY_HOOK_URL env var.
 */

export const config = { runtime: "edge" };

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // ── Optional webhook secret validation ────────────────────────────────────
  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (webhookSecret) {
    const receivedSecret = request.headers.get("x-webhook-secret");
    if (receivedSecret !== webhookSecret) {
      console.warn("[redeploy] Unauthorized webhook call rejected");
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;

  if (!deployHookUrl || deployHookUrl.includes("...")) {
    console.warn("[redeploy] VERCEL_DEPLOY_HOOK_URL not configured — skipping redeploy");
    return new Response(JSON.stringify({ status: "skipped", reason: "not configured" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Parse the Supabase webhook payload for logging
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const table = (body.table as string) ?? "unknown";
    const type  = (body.type  as string) ?? "unknown";

    console.log(`[redeploy] Content change detected: ${type} on ${table} — triggering Vercel rebuild`);

    // Trigger Vercel redeploy
    const deployResponse = await fetch(deployHookUrl, { method: "POST" });

    if (!deployResponse.ok) {
      const error = await deployResponse.text();
      console.error("[redeploy] Vercel deploy hook failed:", error);
      return new Response(JSON.stringify({ status: "error", error }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const responseData = await deployResponse.json() as Record<string, unknown>;
    console.log("[redeploy] Vercel rebuild triggered. Job ID:", responseData.job?.id ?? "unknown");

    return new Response(JSON.stringify({ status: "ok", job: responseData }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[redeploy] Unexpected error:", err);
    return new Response(JSON.stringify({ status: "error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
