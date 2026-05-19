/**
 * src/lib/analytics.ts
 *
 * Zero-dependency, privacy-first analytics module.
 *
 * Design principles:
 *  - No cookies, no PII. Session ID lives in sessionStorage (clears on tab close).
 *  - Never crashes the portfolio. All sends are wrapped in try/catch.
 *  - Events are queued and flushed in batches to minimise network requests.
 *  - time_on_page uses navigator.sendBeacon on unload for guaranteed delivery.
 *  - Scroll depth uses IntersectionObserver (no per-scroll-tick cost).
 *
 * Usage:
 *   import { initAnalytics, trackEvent, trackSectionView } from '../../lib/analytics';
 */

import type { AnalyticsEventType, SectionName, CtaName } from "../types";

// ─── Constants ────────────────────────────────────────────────────────────────

const ENDPOINT    = "/api/track";
const SESSION_KEY = "crewvia_sid";
const FLUSH_DELAY = 3000;   // ms: flush queue after this idle period
const FLUSH_SIZE  = 8;      // events: flush immediately when queue reaches this

// ─── Session Management ───────────────────────────────────────────────────────

function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      // crypto.randomUUID() is available in all modern browsers (Chrome 92+, FF 95+, Safari 15.4+)
      sid = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    // sessionStorage blocked (e.g. private mode in some browsers)
    return crypto.randomUUID();
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

function flush(): void {
  if (!queue.length) return;
  const events = [...queue];
  queue = [];
  if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }

  try {
    fetch(ENDPOINT, {
      method:    "POST",
      headers:   { "Content-Type": "application/json" },
      body:      JSON.stringify({ session_id: sessionId, events }),
      keepalive: true,   // survives page unload
    }).catch(() => { /* silent */ });
  } catch {
    /* silent — analytics must never crash the portfolio */
  }
}

function scheduleFlush(): void {
  if (queue.length >= FLUSH_SIZE) {
    flush();
    return;
  }
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(flush, FLUSH_DELAY);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Track any analytics event. Safe to call before initAnalytics()
 * (events will be queued and sent once the session is ready).
 */
export function trackEvent(
  type: AnalyticsEventType,
  data?: Record<string, unknown>
): void {
  queue.push({
    event_type: type,
    event_data: data ?? null,
  });
  scheduleFlush();
}

/** Convenience wrapper — called from GSAP ScrollTrigger onEnter callbacks. */
export function trackSectionView(section: SectionName): void {
  trackEvent("section_view", { section });
}

/** Convenience wrapper for CTA button clicks. */
export function trackCta(cta: CtaName): void {
  trackEvent("cta_click", { cta });
}

// ─── Scroll Depth Tracking ────────────────────────────────────────────────────

const DEPTHS: Array<25 | 50 | 75 | 100> = [25, 50, 75, 100];
const depthFired = new Set<number>();

function initScrollDepth(): void {
  // Use IntersectionObserver on sentinel divs injected at each depth
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
          // All depths hit — clean up
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
    if (seconds < 2) return; // ignore accidental quick bounces

    const payload = JSON.stringify({
      session_id: sessionId,
      events:     [{ event_type: "time_on_page", event_data: { seconds } }],
    });

    // sendBeacon is fire-and-forget, survives page unload
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: "application/json" }));
    }
  }

  // Fire on tab hide (user switches tabs or minimises window)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") sendTimeOnPage();
  });

  // Fire before the page unloads (browser back, close, navigate away)
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
 * Sets up session, fires page_view, and attaches all passive listeners.
 */
export function initAnalytics(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  sessionId = getSessionId();

  // page_view fires immediately — no delay
  queue.push({ event_type: "page_view", event_data: { path: window.location.pathname } });
  scheduleFlush();

  initScrollDepth();
  initTimeTracking();
  initLinkTracking();
}
