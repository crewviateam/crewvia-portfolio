/**
 * src/lib/analytics.ts
 *
 * Zero-dependency, privacy-first analytics engine — v2.0
 *
 * PHASE 1  — UTM Campaign Tracking   (captures utm_* URL params, attaches to all events)
 * PHASE 2  — Return Visitor Detection (persistent visitor_id via localStorage)
 * PHASE 6  — Project Hover Duration   (tracks mouseleave to measure hover time in ms)
 *
 * Design principles:
 *  - No cookies, no PII. session_id in sessionStorage, visitor_id in localStorage.
 *  - Never crashes the portfolio. All sends are wrapped in try/catch.
 *  - Events are queued and flushed in batches to minimise network requests.
 *  - time_on_page uses navigator.sendBeacon on unload for guaranteed delivery.
 *  - Scroll depth uses IntersectionObserver (no per-scroll-tick cost).
 *  - UTM params are captured once and attached to EVERY event for full attribution.
 */

import type { AnalyticsEventType, SectionName, CtaName } from "../types";

// ─── Constants ────────────────────────────────────────────────────────────────

const ENDPOINT    = "/api/track";
const SESSION_KEY = "crewvia_sid";
const VISITOR_KEY = "crewvia_vid";   // Phase 2: persists across sessions (localStorage)
const UTM_KEY     = "crewvia_utm";   // Phase 1: UTM params cached for session
const FLUSH_DELAY = 3000;            // ms: flush queue after idle
const FLUSH_SIZE  = 8;               // events: flush immediately when queue hits this

// ─── Phase 1: UTM Capture ─────────────────────────────────────────────────────

interface UTMParams {
  source:   string | null;
  medium:   string | null;
  campaign: string | null;
  content:  string | null;
  term:     string | null;
}

/** Read UTM params from the URL once, cache in sessionStorage for the session. */
function captureUTM(): UTMParams | null {
  try {
    // Return cached UTM if already captured this session
    const cached = sessionStorage.getItem(UTM_KEY);
    if (cached) return JSON.parse(cached) as UTMParams;

    const params = new URLSearchParams(window.location.search);
    const source   = params.get("utm_source");
    const medium   = params.get("utm_medium");
    const campaign = params.get("utm_campaign");
    const content  = params.get("utm_content");
    const term     = params.get("utm_term");

    // Only persist and fire event if at least one UTM param present
    if (!source && !medium && !campaign) return null;

    const utm: UTMParams = { source, medium, campaign, content, term };
    sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
    return utm;
  } catch {
    return null;
  }
}

/** Get cached UTM for the current session (null if no UTM params). */
function getUTM(): UTMParams | null {
  try {
    const cached = sessionStorage.getItem(UTM_KEY);
    return cached ? (JSON.parse(cached) as UTMParams) : null;
  } catch {
    return null;
  }
}

// ─── Phase 2: Session + Visitor Management ───────────────────────────────────

function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return crypto.randomUUID();
  }
}

/**
 * Persistent visitor ID stored in localStorage.
 * Survives tab close / browser restart → identifies return visitors.
 * NOT a cookie — disclosed in privacy policy as "analytics storage".
 */
function getVisitorId(): string {
  try {
    let vid = localStorage.getItem(VISITOR_KEY);
    if (!vid) {
      vid = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, vid);
    }
    return vid;
  } catch {
    // localStorage blocked (incognito on some browsers) — use session-scoped fallback
    return getSessionId();
  }
}

// ─── Event Queue ──────────────────────────────────────────────────────────────

interface QueuedEvent {
  event_type: string;
  event_data: Record<string, unknown> | null;
}

let queue:      QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let sessionId   = "";
let visitorId   = "";
let currentUTM: UTMParams | null = null;

function flush(): void {
  if (!queue.length) return;
  const events = [...queue];
  queue = [];
  if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }

  try {
    fetch(ENDPOINT, {
      method:    "POST",
      headers:   { "Content-Type": "application/json" },
      body:      JSON.stringify({
        session_id: sessionId,
        visitor_id: visitorId,   // Phase 2: included in every flush
        events,
      }),
      keepalive: true,
    }).catch(() => { /* silent */ });
  } catch {
    /* analytics must never crash the portfolio */
  }
}

function scheduleFlush(): void {
  if (queue.length >= FLUSH_SIZE) { flush(); return; }
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(flush, FLUSH_DELAY);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Track any analytics event.
 * UTM context is automatically merged into event_data for full attribution.
 */
export function trackEvent(
  type: AnalyticsEventType,
  data?: Record<string, unknown>
): void {
  // Phase 1: Attach UTM to every event so any event can be attributed to a campaign
  const utm = currentUTM ?? getUTM();
  const eventData = utm
    ? { ...data, utm: { source: utm.source, medium: utm.medium, campaign: utm.campaign } }
    : (data ?? null);

  queue.push({ event_type: type, event_data: eventData });
  scheduleFlush();
}

/** Convenience: section view (called from GSAP ScrollTrigger callbacks). */
export function trackSectionView(section: SectionName): void {
  trackEvent("section_view", { section });
}

/** Convenience: CTA button click. */
export function trackCta(cta: CtaName): void {
  trackEvent("cta_click", { cta });
}

// ─── Phase 6: Project Hover Duration Tracking ─────────────────────────────────

const hoverStartTimes = new Map<string, number>();

/**
 * Call on project card mouseenter.
 * Pair with trackProjectHoverEnd() on mouseleave.
 */
export function trackProjectHoverStart(projectId: string): void {
  hoverStartTimes.set(projectId, performance.now());
  trackEvent("project_hover", { project_id: projectId, phase: "start" });
}

/**
 * Call on project card mouseleave.
 * Fires a project_hover event with duration in ms for heatmap analysis.
 */
export function trackProjectHoverEnd(projectId: string, projectTitle: string): void {
  const start = hoverStartTimes.get(projectId);
  const durationMs = start ? Math.round(performance.now() - start) : 0;
  hoverStartTimes.delete(projectId);

  // Only track if hovered for at least 300ms (ignores accidental mouseovers)
  if (durationMs >= 300) {
    trackEvent("project_hover", {
      project_id:     projectId,
      project_title:  projectTitle,
      hover_duration_ms: durationMs,
      phase: "end",
    });
  }
}

// ─── Scroll Depth Tracking ────────────────────────────────────────────────────

const DEPTHS: Array<25 | 50 | 75 | 100> = [25, 50, 75, 100];
const depthFired = new Set<number>();

function initScrollDepth(): void {
  const sentinels: HTMLElement[] = DEPTHS.map((depth) => {
    const el = document.createElement("div");
    el.style.cssText = "position:absolute;width:1px;height:1px;pointer-events:none;";
    el.style.top     = `${depth}%`;
    el.setAttribute("aria-hidden", "true");
    el.setAttribute("data-depth", String(depth));
    document.body.appendChild(el);
    return el;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const depth = Number(entry.target.getAttribute("data-depth")) as 25 | 50 | 75 | 100;
      if (!depthFired.has(depth)) {
        depthFired.add(depth);
        trackEvent("scroll_depth", { depth });
        if (depthFired.size === DEPTHS.length) {
          observer.disconnect();
          sentinels.forEach((el) => el.remove());
        }
      }
    });
  }, { threshold: 0, rootMargin: "0px" });

  sentinels.forEach((el) => observer.observe(el));
}

// ─── Time on Page ─────────────────────────────────────────────────────────────

function initTimeTracking(): void {
  const startTime = performance.now();

  function sendTimeOnPage(): void {
    const seconds = Math.round((performance.now() - startTime) / 1000);
    if (seconds < 2) return;

    const utm = currentUTM ?? getUTM();
    const eventData: Record<string, unknown> = { seconds };
    if (utm?.source) {
      eventData.utm = { source: utm.source, medium: utm.medium, campaign: utm.campaign };
    }

    const payload = JSON.stringify({
      session_id: sessionId,
      visitor_id: visitorId,
      events: [{ event_type: "time_on_page", event_data: eventData }],
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: "application/json" }));
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") sendTimeOnPage();
  });
  window.addEventListener("beforeunload", sendTimeOnPage);
}

// ─── Link Click Delegation ────────────────────────────────────────────────────

function initLinkTracking(): void {
  document.addEventListener("click", (e) => {
    const target = (e.target as HTMLElement).closest("a[data-track]") as HTMLAnchorElement | null;
    if (!target) return;
    const label = target.getAttribute("data-track") ?? target.textContent?.trim() ?? "";
    const href  = target.href ?? "";
    trackEvent("link_click", { label, href });
  });
}

// ─── Init ─────────────────────────────────────────────────────────────────────

let initialized = false;

/**
 * Call once in App.tsx useEffect.
 * Sets up session, visitor ID, captures UTM, fires page_view,
 * and attaches all passive listeners.
 */
export function initAnalytics(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  sessionId   = getSessionId();
  visitorId   = getVisitorId();  // Phase 2: persistent across sessions
  currentUTM  = captureUTM();    // Phase 1: reads ?utm_* params from URL

  // page_view — fired immediately, includes UTM if present
  const pageData: Record<string, unknown> = { path: window.location.pathname };
  if (currentUTM) {
    pageData.utm = {
      source:   currentUTM.source,
      medium:   currentUTM.medium,
      campaign: currentUTM.campaign,
      content:  currentUTM.content,
      term:     currentUTM.term,
    };
  }
  queue.push({ event_type: "page_view", event_data: pageData });

  // Phase 1: Fire dedicated utm_visit event so it's easily queryable
  if (currentUTM?.source) {
    queue.push({
      event_type: "utm_visit",
      event_data: {
        source:   currentUTM.source,
        medium:   currentUTM.medium,
        campaign: currentUTM.campaign,
        content:  currentUTM.content,
        term:     currentUTM.term,
      },
    });
  }

  scheduleFlush();

  initScrollDepth();
  initTimeTracking();
  initLinkTracking();
}
