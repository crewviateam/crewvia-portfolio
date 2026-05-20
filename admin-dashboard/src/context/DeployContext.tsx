/**
 * src/context/DeployContext.tsx — v2 (Production Grade)
 *
 * DESIGN DECISIONS:
 *
 * 1. Identity-based tracking (Map, not Array)
 *    Each change is keyed by a stable `changeKey` (e.g. "site_content::hero_tagline").
 *    Saving the same field twice updates the *existing* entry — never creates a duplicate.
 *
 * 2. Net-zero detection
 *    If the current value after a save equals the original value from session start
 *    (via JSON.stringify comparison), the entry is removed automatically.
 *    If the map becomes empty, the auto-deploy timer is cancelled — no deploy fires.
 *
 * 3. Undo per change
 *    Each TrackedChange carries an `undoFn` closure (provided by the caller) that
 *    knows how to revert to the original value. Undo re-runs net-zero detection.
 *
 * 4. Stale-closure-safe timers
 *    The auto-deploy setTimeout references a stable ref (executeDeployRef) instead
 *    of the function directly, preventing stale closures from previous renders.
 *
 * 5. Timer lifecycle
 *    - markDirty() → starts/resets 5-min timer
 *    - Net-zero clears entry; if map is empty → clears timer immediately
 *    - undoChange / undoAll → re-runs net-zero; clears timer if nothing left
 *    - deployNow / auto-deploy → clears map + timer
 *
 * API:
 *   markDirty(options: MarkDirtyOptions)  — call after any successful Supabase save
 *   undoChange(changeKey: string)         — undo a single field
 *   undoAll()                             — undo every pending change
 *   deployNow()                           — deploy immediately
 */
import React, {
  createContext, useCallback, useContext,
  useEffect, useRef, useState,
} from "react";
import { triggerRedeploy } from "../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TrackedChange {
  changeKey:      string;    // stable unique key: "table::recordId"
  label:          string;    // human-readable e.g. "Updated hero_tagline"
  originalValue:  unknown;   // value BEFORE any changes this session (never updated)
  currentValue:   unknown;   // value AFTER the most recent save (updated on each re-save)
  timestamp:      number;    // when the most recent save happened
  isUndoing:      boolean;   // true while the undo async op is running
  undoFn:         () => Promise<void>; // async closure to revert to originalValue
}

export interface MarkDirtyOptions {
  /** Stable unique identifier. Convention: "table::primaryKeyValue" e.g. "site_content::hero_tagline" */
  changeKey:     string;
  /** Human-readable label shown in the DeployBanner */
  label:         string;
  /** The value BEFORE this save (used for net-zero detection and undo). Pass null if unknown. */
  previousValue: unknown;
  /** The value AFTER this save */
  currentValue:  unknown;
  /** Async function that reverts this field to originalValue in Supabase */
  undoFn:       () => Promise<void>;
}

interface DeployContextValue {
  markDirty:       (opts: MarkDirtyOptions) => void;
  undoChange:      (changeKey: string) => Promise<void>;
  undoAll:         () => Promise<void>;
  deployNow:       () => Promise<void>;
  isDeploying:     boolean;
  countdown:       number;         // seconds remaining until auto-deploy
  pendingChanges:  TrackedChange[]; // ordered array for rendering
  isDirty:         boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AUTO_DEPLOY_DELAY_MS = 5 * 60 * 1000; // 5 minutes
const TICK_MS              = 1000;

// Deep-equality via JSON (sufficient for strings, numbers, and simple objects)
function deepEqual(a: unknown, b: unknown): boolean {
  try { return JSON.stringify(a) === JSON.stringify(b); } catch { return false; }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const DeployContext = createContext<DeployContextValue | null>(null);

export function DeployProvider({ children }: { children: React.ReactNode }) {
  // Use a Map for O(1) identity-based lookups
  const [changesMap, setChangesMap] = useState<Map<string, TrackedChange>>(new Map());
  const [isDeploying, setIsDeploying] = useState(false);
  const [countdown,   setCountdown]   = useState(0);

  // Timer refs — avoids stale closures
  const autoTimerRef    = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetTimeRef   = useRef<number | null>(null);
  // Stable ref to the deploy fn — setTimeout always calls the latest version
  const executeDeployRef = useRef<() => Promise<void>>(async () => {});

  // Derived state
  const pendingChanges = Array.from(changesMap.values())
    .sort((a, b) => a.timestamp - b.timestamp);
  const isDirty = changesMap.size > 0;

  // ── Timer management ────────────────────────────────────────────────────────
  const clearTimers = useCallback(() => {
    if (autoTimerRef.current)    { clearTimeout(autoTimerRef.current);   autoTimerRef.current    = null; }
    if (tickIntervalRef.current) { clearInterval(tickIntervalRef.current); tickIntervalRef.current = null; }
    setCountdown(0);
    targetTimeRef.current = null;
  }, []);

  const startTimer = useCallback(() => {
    clearTimers();
    const target = Date.now() + AUTO_DEPLOY_DELAY_MS;
    targetTimeRef.current = target;

    setCountdown(Math.round(AUTO_DEPLOY_DELAY_MS / 1000));
    tickIntervalRef.current = setInterval(() => {
      const rem = Math.max(0, Math.round((target - Date.now()) / 1000));
      setCountdown(rem);
      if (rem === 0 && tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    }, TICK_MS);

    // Use ref so the timeout always calls the up-to-date deploy function
    autoTimerRef.current = setTimeout(() => {
      executeDeployRef.current();
    }, AUTO_DEPLOY_DELAY_MS);
  }, [clearTimers]);

  // ── Core deploy ─────────────────────────────────────────────────────────────
  const executeDeploy = useCallback(async () => {
    clearTimers();
    setIsDeploying(true);
    await triggerRedeploy();
    setChangesMap(new Map());
    setIsDeploying(false);
  }, [clearTimers]);

  // Keep ref fresh every render so setTimeout always calls the current version
  useEffect(() => { executeDeployRef.current = executeDeploy; });

  // ── markDirty ───────────────────────────────────────────────────────────────
  const markDirty = useCallback((opts: MarkDirtyOptions) => {
    const { changeKey, label, previousValue, currentValue, undoFn } = opts;

    setChangesMap(prev => {
      const next = new Map(prev);
      const existing = next.get(changeKey);

      // Determine what the original value was before ANY change this session
      const originalValue = existing ? existing.originalValue : previousValue;

      // Net-zero: current value matches what it was at session start → cancel this change
      if (deepEqual(currentValue, originalValue)) {
        next.delete(changeKey);
        // If map is now empty, clear the timer after state update
        if (next.size === 0) {
          // Schedule timer clear outside state update (safe: runs after render)
          setTimeout(() => clearTimers(), 0);
        }
        return next;
      }

      // Upsert the change entry
      next.set(changeKey, {
        changeKey,
        label,
        originalValue,
        currentValue,
        timestamp: Date.now(),
        isUndoing: false,
        undoFn,
      });
      return next;
    });

    // Start/reset the 5-min timer (only if there will be pending changes)
    // We do this outside setChangesMap so it always runs even on net-zero
    // (clearTimers handles the net-zero case via the setTimeout above)
    startTimer();
  }, [startTimer, clearTimers]);

  // ── undoChange ──────────────────────────────────────────────────────────────
  const undoChange = useCallback(async (changeKey: string) => {
    const change = changesMap.get(changeKey);
    if (!change || change.isUndoing) return;

    // Mark as undoing (shows spinner in UI)
    setChangesMap(prev => {
      const next = new Map(prev);
      const entry = next.get(changeKey);
      if (entry) next.set(changeKey, { ...entry, isUndoing: true });
      return next;
    });

    try {
      await change.undoFn();
    } catch (err) {
      console.error("[DeployContext] undoFn failed:", err);
      // Un-mark isUndoing on failure
      setChangesMap(prev => {
        const next = new Map(prev);
        const entry = next.get(changeKey);
        if (entry) next.set(changeKey, { ...entry, isUndoing: false });
        return next;
      });
      return;
    }

    // Remove the change — the undo PUT it back to original, net-zero achieved
    setChangesMap(prev => {
      const next = new Map(prev);
      next.delete(changeKey);
      if (next.size === 0) setTimeout(() => clearTimers(), 0);
      return next;
    });
  }, [changesMap, clearTimers]);

  // ── undoAll ─────────────────────────────────────────────────────────────────
  const undoAll = useCallback(async () => {
    // Run all undoFns in parallel for speed
    await Promise.allSettled(
      Array.from(changesMap.values()).map(c => c.undoFn())
    );
    clearTimers();
    setChangesMap(new Map());
  }, [changesMap, clearTimers]);

  // ── deployNow ───────────────────────────────────────────────────────────────
  const deployNow = useCallback(async () => {
    if (isDeploying) return;
    await executeDeploy();
  }, [isDeploying, executeDeploy]);

  // Cleanup on unmount
  useEffect(() => () => clearTimers(), [clearTimers]);

  return (
    <DeployContext.Provider value={{
      markDirty, undoChange, undoAll, deployNow,
      isDeploying, countdown, pendingChanges, isDirty,
    }}>
      {children}
    </DeployContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDeploy(): DeployContextValue {
  const ctx = useContext(DeployContext);
  if (!ctx) throw new Error("useDeploy must be used inside <DeployProvider>");
  return ctx;
}
