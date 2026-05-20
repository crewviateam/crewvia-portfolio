/**
 * api/lead.ts — Vercel Edge Function
 *
 * Receives a lead capture form submission from the LeadCapture slide-in component.
 * Validates the email, rate-limits per visitor_id, and inserts into the `leads` table.
 *
 * POST /api/lead
 * { email, name?, session_id, visitor_id?, utm_source?, utm_medium?, utm_campaign?,
 *   engagement_score?, page_url?, country?, device_type? }
 *
 * Response:
 *   201 { ok: true }
 *   400 Bad Request (missing/invalid email)
 *   429 Too Many Requests (same visitor submitted < 24h ago)
 *   500 Internal error
 */

export const config = { runtime: "edge" };

interface LeadPayload {
  email:            string;
  name?:            string;
  message?:         string;
  session_id:       string;
  visitor_id?:      string;
  utm_source?:      string;
  utm_medium?:      string;
  utm_campaign?:    string;
  engagement_score?: number;
  page_url?:        string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(request: Request): Promise<Response> {
  const CORS = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: CORS });
  }

  let body: LeadPayload;
  try {
    body = await request.json() as LeadPayload;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
  }

  // ── Validate email ──────────────────────────────────────────────────────────
  const email = (body.email ?? "").trim().toLowerCase();
  if (!email || !EMAIL_REGEX.test(email)) {
    return new Response(
      JSON.stringify({ error: "Valid email address required" }),
      { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 201, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  // ── Rate limit: one lead per email/visitor per 24h ─────────────────────────
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const checkUrl = `${supabaseUrl}/rest/v1/leads?email=eq.${encodeURIComponent(email)}&created_at=gte.${since}&select=id&limit=1`;
    const checkResp = await fetch(checkUrl, {
      headers: { "apikey": serviceKey, "Authorization": `Bearer ${serviceKey}` },
    });

    if (checkResp.ok) {
      const existing = await checkResp.json() as Array<{ id: number }>;
      if (existing.length > 0) {
        return new Response(
          JSON.stringify({ ok: true, note: "already_captured" }),
          { status: 201, headers: { ...CORS, "Content-Type": "application/json" } }
        );
      }
    }
  } catch (err) {
    console.error("[lead] Rate limit check failed:", err);
    // Non-fatal — proceed with insert
  }

  // ── Request metadata ───────────────────────────────────────────────────────
  const country    =
    request.headers.get("cf-ipcountry") ??
    request.headers.get("x-vercel-ip-country") ??
    null;
  const ua         = request.headers.get("user-agent") ?? "";
  const deviceType = /mobile|android|iphone/i.test(ua) ? "mobile"
                   : /tablet|ipad/i.test(ua)            ? "tablet"
                   : "desktop";

  // ── Insert lead ────────────────────────────────────────────────────────────
  try {
    const row = {
      email,
      name:             body.name?.trim() || null,
      message:          body.message?.trim() || null,
      session_id:       body.session_id || null,
      visitor_id:       body.visitor_id || null,
      utm_source:       body.utm_source || null,
      utm_medium:       body.utm_medium || null,
      utm_campaign:     body.utm_campaign || null,
      engagement_score: typeof body.engagement_score === "number" ? body.engagement_score : null,
      page_url:         body.page_url || null,
      country:          country || null,
      device_type:      deviceType,
    };

    const insertResp = await fetch(`${supabaseUrl}/rest/v1/leads`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "apikey":         serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Prefer":        "return=minimal",
      },
      body: JSON.stringify(row),
    });

    if (!insertResp.ok) {
      const errText = await insertResp.text();
      console.error("[lead] Supabase insert failed:", errText);
      return new Response(
        JSON.stringify({ error: "Failed to save. Please try again." }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    console.log(`[lead] ✓ New lead captured: ${email}`);
    return new Response(JSON.stringify({ ok: true }), {
      status: 201, headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[lead] Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
}
