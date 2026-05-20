/**
 * api/deploy-proxy.ts
 * Vercel Edge Function — Proxies the Vercel deploy hook call server-side.
 *
 * WHY this exists:
 *   Calling api.vercel.com from the browser triggers a CORS error because
 *   Vercel's deploy hook endpoint has no Access-Control-Allow-Origin header.
 *   This proxy receives the POST from the admin dashboard (same origin),
 *   then forwards it to the actual Vercel deploy hook URL — entirely server-side.
 *
 * Security: The hookUrl is validated against the configured env var so an
 * attacker can't proxy arbitrary URLs through this endpoint.
 */
export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  // Only allow POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Parse body
  let hookUrl: string;
  try {
    const body = await req.json() as { hookUrl?: string };
    hookUrl = body.hookUrl ?? "";
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  // Validate: must match the configured deploy hook prefix
  const configured = process.env.VITE_DEPLOY_HOOK_URL ?? "";
  if (!hookUrl || !configured || hookUrl !== configured) {
    console.error("[deploy-proxy] hookUrl mismatch — rejected");
    return new Response("Forbidden", { status: 403 });
  }

  // Forward to Vercel
  try {
    const res = await fetch(hookUrl, { method: "POST" });
    console.log(`[deploy-proxy] Vercel hook responded: ${res.status}`);
    return new Response(
      JSON.stringify({ ok: res.ok, status: res.status }),
      { status: res.ok ? 200 : 502, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[deploy-proxy] fetch to Vercel failed:", err);
    return new Response("Bad Gateway", { status: 502 });
  }
}
