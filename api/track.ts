/**
 * api/track.ts — Vercel Edge Function v2
 *
 * PHASE 1  — Stores utm_* fields extracted from event_data
 * PHASE 2  — Accepts visitor_id for return-visitor detection
 * PHASE 3  — Computes engagement score per session after insert
 * PHASE 10 — Reads cf-ipcity for city-level geographic data
 *
 * Request format:
 *   POST /api/track
 *   { session_id, visitor_id?, events: [{ event_type, event_data }] }
 *
 * Response: 204 (analytics never blocks UI)
 */

export const config = { runtime: "edge" };

// ─── Types ────────────────────────────────────────────────────────────────────

interface IncomingEvent {
  event_type: string;
  event_data: Record<string, unknown> | null;
}

interface TrackPayload {
  session_id: string;
  visitor_id?: string;             // Phase 2
  events:     IncomingEvent[];
}

// ─── Engagement Score Formula (Phase 3) ──────────────────────────────────────

const SCORE_MAP: Record<string, number> = {
  utm_visit:     10,
  link_click:    15,
  cta_click:     25,
  project_hover: 10,
};

function scoreEvent(event: IncomingEvent): number {
  const base = SCORE_MAP[event.event_type] ?? 0;

  // Bonus for deeper scroll milestones
  if (event.event_type === "scroll_depth") {
    const depth = (event.event_data?.depth as number) ?? 0;
    if (depth >= 100) return 25;
    if (depth >= 75)  return 20;
    if (depth >= 50)  return 15;
    return 0; // 25% gives no points — too early
  }

  // Bonus for longer time on page
  if (event.event_type === "time_on_page") {
    const s = (event.event_data?.seconds as number) ?? 0;
    if (s >= 300) return 25; // 5+ minutes
    if (s >= 120) return 20; // 2+ minutes
    if (s >= 60)  return 15; // 1+ minute
    return 0;
  }

  return base;
}

// ─── Device detection ─────────────────────────────────────────────────────────

function detectDevice(ua: string): "mobile" | "tablet" | "desktop" {
  if (/tablet|ipad|playbook|silk/i.test(ua))             return "tablet";
  if (/mobile|android|iphone|ipod|blackberry/i.test(ua)) return "mobile";
  return "desktop";
}

// ─── Extract UTM from event_data ─────────────────────────────────────────────

function extractUTM(events: IncomingEvent[]): {
  utm_source?: string; utm_medium?: string; utm_campaign?: string;
  utm_content?: string; utm_term?: string;
} {
  // Find the utm_visit event or any event with utm in data
  for (const ev of events) {
    const utm = ev.event_data?.utm as Record<string, string> | undefined;
    if (utm?.source) {
      return {
        utm_source:   utm.source   ?? undefined,
        utm_medium:   utm.medium   ?? undefined,
        utm_campaign: utm.campaign ?? undefined,
        utm_content:  utm.content  ?? undefined,
        utm_term:     utm.term     ?? undefined,
      };
    }
  }
  return {};
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default async function handler(request: Request): Promise<Response> {
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

  let payload: TrackPayload;
  try {
    payload = await request.json() as TrackPayload;
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  const { session_id, visitor_id, events } = payload;
  if (!session_id || !Array.isArray(events) || !events.length) {
    return new Response("Bad Request", { status: 400 });
  }

  // ── Request metadata ───────────────────────────────────────────────────────
  const userAgent  = request.headers.get("user-agent")      ?? "";
  const referrer   = request.headers.get("referer")         ?? "";
  const country    =
    request.headers.get("cf-ipcountry")                     ??
    request.headers.get("x-vercel-ip-country")              ??
    "XX";
  const city       = request.headers.get("cf-ipcity")       ?? null;  // Phase 10
  const deviceType = detectDevice(userAgent);

  // ── Credentials ────────────────────────────────────────────────────────────
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return new Response(null, { status: 204 });
  }

  // ── Extract UTM from event batch ───────────────────────────────────────────
  const utmFields = extractUTM(events);

  // ── Build insert rows ──────────────────────────────────────────────────────
  const rows = events.map((event) => ({
    session_id,
    visitor_id:  visitor_id || null,          // Phase 2
    event_type:  event.event_type,
    event_data:  event.event_data ?? null,
    referrer:    referrer || null,
    user_agent:  userAgent || null,
    country:     country !== "XX" ? country : null,
    city:        city || null,                // Phase 10
    device_type: deviceType,
    ...utmFields,                             // Phase 1: utm_source, utm_medium, etc.
  }));

  // ── Insert events ──────────────────────────────────────────────────────────
  try {
    const insertResp = await fetch(`${supabaseUrl}/rest/v1/analytics_events`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "apikey":         serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Prefer":        "return=minimal",
      },
      body: JSON.stringify(rows),
    });

    if (!insertResp.ok) {
      console.error("[track] Insert failed:", await insertResp.text());
    }
  } catch (err) {
    console.error("[track] Network error on insert:", err);
  }

  // ── Phase 3: Compute & upsert engagement score for this session ────────────
  try {
    // Calculate score contribution from THIS batch
    const batchScore = events.reduce((sum, ev) => sum + scoreEvent(ev), 0);

    if (batchScore > 0) {
      // Fetch current session total from session_scores, then upsert updated total
      const scoreResp = await fetch(
        `${supabaseUrl}/rest/v1/session_scores?session_id=eq.${encodeURIComponent(session_id)}&select=score`,
        {
          headers: {
            "apikey":         serviceKey,
            "Authorization": `Bearer ${serviceKey}`,
          },
        }
      );

      let currentScore = 0;
      if (scoreResp.ok) {
        const scoreData = await scoreResp.json() as Array<{ score: number }>;
        currentScore = scoreData[0]?.score ?? 0;
      }

      const newScore = Math.min(100, currentScore + batchScore); // cap at 100

      await fetch(`${supabaseUrl}/rest/v1/session_scores`, {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "apikey":         serviceKey,
          "Authorization": `Bearer ${serviceKey}`,
          "Prefer":        "resolution=merge-duplicates",
        },
        body: JSON.stringify({
          session_id,
          visitor_id:   visitor_id || null,
          score:        newScore,
          device_type:  deviceType,
          country:      country !== "XX" ? country : null,
          utm_source:   utmFields.utm_source   || null,
          utm_campaign: utmFields.utm_campaign || null,
          updated_at:   new Date().toISOString(),
        }),
      });
    }
  } catch (err) {
    console.error("[track] Score upsert failed:", err);
    // Non-critical — don't fail the whole request
  }

  return new Response(null, { status: 204 });
}
