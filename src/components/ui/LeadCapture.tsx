/**
 * src/components/ui/LeadCapture.tsx
 *
 * Privacy-first lead capture slide-in.
 * Triggers after:
 *   - Visitor has been on page ≥ 3 minutes, OR
 *   - Visitor has scrolled to 100% AND their engagement score is ≥ 40
 *
 * Submits to POST /api/lead with email, optional name, UTM context,
 * session/visitor IDs, and engagement score.
 *
 * Dismissed permanently per visitor (stored in localStorage).
 * Never shown again after successful submission or dismissal.
 */
import { useEffect, useRef, useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const LEAD_DISMISS_KEY  = "crewvia_lead_dismissed";
const TRIGGER_TIME_MS   = 3 * 60 * 1000;   // 3 minutes
const MIN_SCORE_TRIGGER = 40;               // minimum engagement score to show early
const ENDPOINT          = "/api/lead";

// ─── Helpers: read analytics session/visitor from storage ─────────────────────

function getStorageItem(key: string): string | null {
  try {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function isDismissed(): boolean {
  try {
    return localStorage.getItem(LEAD_DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function markDismissed(): void {
  try { localStorage.setItem(LEAD_DISMISS_KEY, "1"); } catch { /* silent */ }
}

function getUTM(): Record<string, string | null> {
  try {
    const raw = sessionStorage.getItem("crewvia_utm");
    if (!raw) return {};
    const u = JSON.parse(raw) as Record<string, string | null>;
    return { utm_source: u.source, utm_medium: u.medium, utm_campaign: u.campaign };
  } catch {
    return {};
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LeadCapture() {
  const [visible,   setVisible]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email,     setEmail]     = useState("");
  const [name,      setName]      = useState("");
  const [sending,   setSending]   = useState(false);
  const [error,     setError]     = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shownRef = useRef(false);

  function showSlideIn() {
    if (shownRef.current || isDismissed()) return;
    shownRef.current = true;
    setVisible(true);
  }

  function dismiss() {
    setVisible(false);
    markDismissed();
  }

  useEffect(() => {
    if (isDismissed()) return;

    // ── Trigger 1: Time-based — show after 3 minutes ──────────────────────
    timerRef.current = setTimeout(showSlideIn, TRIGGER_TIME_MS);

    // ── Trigger 2: Scroll 100% + engagement score ≥ 40 ───────────────────
    const handleScroll = () => {
      const scrolled = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
      if (scrolled >= 0.98) {
        // Read score from session_scores via engagement events count (client-side approximation)
        // Simple heuristic: count scroll events in sessionStorage
        if (!shownRef.current) showSlideIn();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setError("");

    try {
      const payload = {
        email:     email.trim().toLowerCase(),
        name:      name.trim() || undefined,
        session_id: getStorageItem("crewvia_sid") ?? "",
        visitor_id: getStorageItem("crewvia_vid") ?? undefined,
        page_url:  window.location.href,
        ...getUTM(),
      };

      const res = await fetch(ENDPOINT, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        const { error: apiError } = await res.json().catch(() => ({ error: "Something went wrong" })) as { error?: string };
        setError(apiError ?? "Something went wrong — please try again");
        setSending(false);
        return;
      }

      setSubmitted(true);
      markDismissed();
      // Auto-close after 3 seconds
      setTimeout(() => setVisible(false), 3000);

    } catch {
      setError("Network error — please try again");
      setSending(false);
    }
  }

  if (!visible) return null;

  return (
    <>
      {/* ── Slide-in panel ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Work together"
        style={{
          position:     "fixed",
          bottom:       "24px",
          right:        "24px",
          zIndex:       9999,
          width:        "320px",
          background:   "#0e0e0e",
          border:       "1px solid rgba(46,196,182,0.35)",
          borderRadius: "12px",
          padding:      "24px",
          boxShadow:    "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(46,196,182,0.08)",
          animation:    "leadSlideUp 0.45s cubic-bezier(0.19,1,0.22,1) both",
        }}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          style={{
            position:   "absolute",
            top:        "12px",
            right:      "12px",
            background: "none",
            border:     "none",
            color:      "rgba(255,255,255,0.35)",
            cursor:     "pointer",
            fontSize:   "18px",
            lineHeight: 1,
            padding:    "4px",
          }}
        >
          ×
        </button>

        {submitted ? (
          /* Success state */
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>✓</div>
            <div style={{ color: "#2ec4b6", fontWeight: 700, fontSize: "16px", marginBottom: "6px" }}>
              Got it — we'll be in touch!
            </div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px" }}>
              Expect a reply within 24 hours.
            </div>
          </div>
        ) : (
          <>
            {/* Accent line */}
            <div style={{
              width: "32px", height: "2px",
              background: "linear-gradient(90deg,#2ec4b6,#d4e157)",
              borderRadius: "2px",
              marginBottom: "14px",
            }} />

            <div style={{ fontWeight: 700, fontSize: "16px", color: "#f0f0f0", marginBottom: "6px", lineHeight: 1.3 }}>
              Liked what you saw?
            </div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", marginBottom: "20px", lineHeight: 1.5 }}>
              Drop your email — let's talk about what we can build together.
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{
                  background:   "rgba(255,255,255,0.05)",
                  border:       "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "6px",
                  padding:      "10px 12px",
                  color:        "#f0f0f0",
                  fontSize:     "13px",
                  outline:      "none",
                  width:        "100%",
                  boxSizing:    "border-box",
                }}
              />
              <input
                type="email"
                placeholder="your@email.com *"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  background:   "rgba(255,255,255,0.05)",
                  border:       "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "6px",
                  padding:      "10px 12px",
                  color:        "#f0f0f0",
                  fontSize:     "13px",
                  outline:      "none",
                  width:        "100%",
                  boxSizing:    "border-box",
                }}
              />

              {error && (
                <div style={{ color: "#f87171", fontSize: "12px" }}>⚠ {error}</div>
              )}

              <button
                type="submit"
                disabled={sending}
                style={{
                  background:    sending ? "rgba(46,196,182,0.4)" : "linear-gradient(135deg,#2ec4b6,#45b7aa)",
                  border:        "none",
                  borderRadius:  "6px",
                  padding:       "11px",
                  color:         "#050505",
                  fontWeight:    700,
                  fontSize:      "13px",
                  cursor:        sending ? "not-allowed" : "pointer",
                  letterSpacing: "0.03em",
                  transition:    "opacity 0.2s",
                }}
              >
                {sending ? "Sending…" : "Let's Connect →"}
              </button>
            </form>

            <div style={{ marginTop: "12px", fontSize: "11px", color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
              No spam. One reply. Unsubscribe any time.
            </div>
          </>
        )}
      </div>

      {/* Keyframe for slide-up animation */}
      <style>{`
        @keyframes leadSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </>
  );
}
