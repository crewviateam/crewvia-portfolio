/**
 * api/track.ts — Vercel Edge Function
 *
 * Receives analytics events from the portfolio frontend and stores them
 * in the Supabase analytics_events table using the service role key.
 *
 * Why Edge Runtime?
 *  - Runs at the CDN edge closest to the visitor (<5ms cold start vs ~250ms Node.js)
 *  - Inherits CF-IPCountry and x-vercel-ip-country headers from Vercel's infrastructure
 *  - Scales to zero cost between requests
 *
 * Request format:
 *   POST /api/track
 *   Content-Type: application/json
 *   { session_id: string, events: Array<{ event_type: string, event_data: any }> }
 *
 * Response: 204 No Content (analytics should never block the UI)
 */

export const config = { runtime: "edge" };

interface IncomingEvent {
  event_type: string;
  event_data: Record<string, unknown> | null;
}

interface TrackPayload {
  session_id: string;
  events:     IncomingEvent[];
}

// ─── Device type detection from User-Agent ────────────────────────────────────
function detectDevice(ua: string): "mobile" | "tablet" | "desktop" {
  if (/tablet|ipad|playbook|silk/i.test(ua))         return "tablet";
  if (/mobile|android|iphone|ipod|blackberry/i.test(ua)) return "mobile";
  return "desktop";
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(request: Request): Promise<Response> {
  // ── CORS pre-flight ─────────────────────────────────────────────────────────
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin":  "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // ── Parse body ──────────────────────────────────────────────────────────────
  let payload: TrackPayload;
  try {
    payload = await request.json() as TrackPayload;
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  const { session_id, events } = payload;

  if (!session_id || !Array.isArray(events) || !events.length) {
    return new Response("Bad Request", { status: 400 });
  }

  // ── Extract request metadata ─────────────────────────────────────────────────
  const userAgent  = request.headers.get("user-agent") ?? "";
  const referrer   = request.headers.get("referer")    ?? "";
  const country    =
    request.headers.get("cf-ipcountry")              ??
    request.headers.get("x-vercel-ip-country")       ??
    "XX";  // XX = unknown country
  const deviceType = detectDevice(userAgent);

  // ── Supabase credentials ─────────────────────────────────────────────────────
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    // Silently ignore if not configured — don't break the portfolio
    return new Response(null, { status: 204 });
  }

  // ── Build rows for bulk insert ────────────────────────────────────────────────
  const rows = events.map((event) => ({
    session_id,
    event_type:  event.event_type,
    event_data:  event.event_data ?? null,
    referrer:    referrer || null,
    user_agent:  userAgent || null,
    country:     country !== "XX" ? country : null,
    device_type: deviceType,
  }));

  // ── Insert to Supabase via REST API ───────────────────────────────────────────
  // We use fetch directly (no Supabase SDK) to keep the Edge bundle small (<100KB)
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/analytics_events`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "apikey":         serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Prefer":        "return=minimal",  // don't return rows — save bandwidth
      },
      body: JSON.stringify(rows),
    });

    if (!response.ok) {
      // Log the error server-side but still return 204 to the client
      const error = await response.text();
      console.error("[track] Supabase insert failed:", error);
    }
  } catch (err) {
    console.error("[track] Network error:", err);
  }

  // Always return 204 — analytics failures must never surface to the user
  return new Response(null, { status: 204 });
}
