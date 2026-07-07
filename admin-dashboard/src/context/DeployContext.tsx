/**
 * src/context/DeployContext.tsx — v3 (Persistent + Cross-Tab)
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
 *    Each TrackedChange carries a serializable `undoRecipe` that allows the undo
 *    operation to be reconstructed after page reload. The recipe stores {table, key,
 *    field, originalValue, action} — everything needed to revert via Supabase.
 *
 * 4. Persistence via localStorage
 *    The changes map and auto-deploy target timestamp are persisted to localStorage.
 *    On mount, state is rehydrated and the countdown timer is reconstructed from
 *    the persisted target timestamp — surviving page reloads and browser restarts.
 *
 * 5. Cross-tab sync via BroadcastChannel
 *    When a deploy completes or changes are undone, all tabs are notified and their
 *    state is cleared. This prevents ghost banners on stale tabs.
 *
 * 6. Stale-closure-safe timers
 *    The auto-deploy setTimeout references a stable ref (executeDeployRef) instead
 *    of the function directly, preventing stale closures from previous renders.
 *
 * 7. Timer lifecycle
 *    - markDirty() → starts/resets 5-min timer, persists target timestamp
 *    - Net-zero clears entry; if map is empty → clears timer + storage
 *    - undoChange / undoAll → re-runs net-zero; clears if nothing left
 *    - deployNow / auto-deploy → clears map + timer + storage
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
import { supabase, triggerRedeploy } from "../lib/supabase";

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const STORAGE_KEY_CHANGES      = "crewvia_deploy_changes";
const STORAGE_KEY_DEPLOY_AT    = "crewvia_deploy_target_time";
const BROADCAST_CHANNEL_NAME   = "crewvia_deploy_sync";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Serializable "recipe" that allows an undo operation to be reconstructed
 * after page reload (closures can't survive serialization).
 */
export interface UndoRecipe {
  /** "update" | "insert" | "delete" — determines how to revert */
  action:        "update" | "insert" | "delete";
  /** Supabase table name */
  table:         string;
  /** The column used for matching (usually "key" for site_content, "id" for CRUD tables) */
  matchColumn:   string;
  /** The value of the match column */
  matchValue:    string;
  /** The field(s) to restore (for "update" actions) */
  originalData:  Record<string, unknown> | null;
  /** Whether to use upsert (for site_content's key-value pattern) */
  useUpsert?:    boolean;
}

export interface TrackedChange {
  changeKey:      string;    // stable unique key: "table::recordId"
  label:          string;    // human-readable e.g. "Updated hero_tagline"
  originalValue:  unknown;   // value BEFORE any changes this session (never updated)
  currentValue:   unknown;   // value AFTER the most recent save (updated on each re-save)
  timestamp:      number;    // when the most recent save happened
  isUndoing:      boolean;   // true while the undo async op is running
  undoRecipe:     UndoRecipe; // serializable recipe for reconstructing undo after reload
}

/** Serializable form of TrackedChange (what goes into localStorage) */
interface PersistedChange {
  changeKey:     string;
  label:         string;
  originalValue: unknown;
  currentValue:  unknown;
  timestamp:     number;
  undoRecipe:    UndoRecipe;
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
  /** Serializable recipe for reconstructing the undo operation after reload */
  undoRecipe:    UndoRecipe;
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

// ─── Persistence Helpers ──────────────────────────────────────────────────────

function persistChanges(changes: Map<string, TrackedChange>) {
  try {
    const serializable: PersistedChange[] = Array.from(changes.values()).map(c => ({
      changeKey:     c.changeKey,
      label:         c.label,
      originalValue: c.originalValue,
      currentValue:  c.currentValue,
      timestamp:     c.timestamp,
      undoRecipe:    c.undoRecipe,
    }));
    localStorage.setItem(STORAGE_KEY_CHANGES, JSON.stringify(serializable));
  } catch (err) {
    console.warn("[DeployContext] Failed to persist changes:", err);
  }
}

function loadPersistedChanges(): Map<string, TrackedChange> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHANGES);
    if (!raw) return new Map();
    const parsed: PersistedChange[] = JSON.parse(raw);
    const map = new Map<string, TrackedChange>();
    for (const p of parsed) {
      map.set(p.changeKey, {
        ...p,
        isUndoing: false, // always reset on reload
      });
    }
    return map;
  } catch (err) {
    console.warn("[DeployContext] Failed to load persisted changes:", err);
    return new Map();
  }
}

function persistDeployTarget(targetMs: number | null) {
  try {
    if (targetMs === null) {
      localStorage.removeItem(STORAGE_KEY_DEPLOY_AT);
    } else {
      localStorage.setItem(STORAGE_KEY_DEPLOY_AT, String(targetMs));
    }
  } catch { /* ignore */ }
}

function loadPersistedDeployTarget(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DEPLOY_AT);
    if (!raw) return null;
    const ts = parseInt(raw, 10);
    return isNaN(ts) ? null : ts;
  } catch { return null; }
}

function clearAllStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY_CHANGES);
    localStorage.removeItem(STORAGE_KEY_DEPLOY_AT);
  } catch { /* ignore */ }
}

// ─── Undo Executor ────────────────────────────────────────────────────────────

/**
 * Executes an undo operation from a recipe. This is the "rehydrated" version
 * of the closure-based undoFn — it works identically after a page reload.
 */
async function executeUndoRecipe(recipe: UndoRecipe): Promise<void> {
  const { action, table, matchColumn, matchValue, originalData, useUpsert } = recipe;

  switch (action) {
    case "update": {
      if (!originalData) return;
      if (useUpsert) {
        await supabase.from(table).upsert(
          { [matchColumn]: matchValue, ...originalData },
          { onConflict: matchColumn }
        );
      } else {
        await supabase.from(table).update(originalData).eq(matchColumn, matchValue);
      }
      break;
    }
    case "insert": {
      // Undo an insert = delete the row
      await supabase.from(table).delete().eq(matchColumn, matchValue);
      break;
    }
    case "delete": {
      // Undo a delete = re-insert the original row
      if (originalData) {
        await supabase.from(table).insert(originalData);
      }
      break;
    }
  }
}

// ─── BroadcastChannel Helper ──────────────────────────────────────────────────

function getBroadcastChannel(): BroadcastChannel | null {
  try {
    return new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch {
    // BroadcastChannel not available (e.g. Safari < 15.4)
    return null;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const DeployContext = createContext<DeployContextValue | null>(null);

export function DeployProvider({ children }: { children: React.ReactNode }) {
  // Rehydrate from localStorage on initial mount
  const [changesMap, setChangesMap] = useState<Map<string, TrackedChange>>(() => loadPersistedChanges());
  const [isDeploying, setIsDeploying] = useState(false);
  const [countdown,   setCountdown]   = useState(0);

  // Timer refs — avoids stale closures
  const autoTimerRef    = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetTimeRef   = useRef<number | null>(null);
  // Stable ref to the deploy fn — setTimeout always calls the latest version
  const executeDeployRef = useRef<() => Promise<void>>(async () => {});
  // BroadcastChannel ref
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Derived state
  const pendingChanges = Array.from(changesMap.values())
    .sort((a, b) => a.timestamp - b.timestamp);
  const isDirty = changesMap.size > 0;

  // ── Persist changes to localStorage whenever the map changes ──────────────
  useEffect(() => {
    persistChanges(changesMap);
  }, [changesMap]);

  // ── Timer management ────────────────────────────────────────────────────────
  const clearTimers = useCallback(() => {
    if (autoTimerRef.current)    { clearTimeout(autoTimerRef.current);   autoTimerRef.current    = null; }
    if (tickIntervalRef.current) { clearInterval(tickIntervalRef.current); tickIntervalRef.current = null; }
    setCountdown(0);
    targetTimeRef.current = null;
    persistDeployTarget(null);
  }, []);

  const startTimerFromTarget = useCallback((target: number) => {
    // Clear any existing timers first
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);

    targetTimeRef.current = target;
    persistDeployTarget(target);

    const remaining = Math.max(0, target - Date.now());

    setCountdown(Math.round(remaining / 1000));
    tickIntervalRef.current = setInterval(() => {
      const rem = Math.max(0, Math.round((target - Date.now()) / 1000));
      setCountdown(rem);
      if (rem === 0 && tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    }, TICK_MS);

    // Use ref so the timeout always calls the up-to-date deploy function
    autoTimerRef.current = setTimeout(() => {
      executeDeployRef.current();
    }, remaining);
  }, []);

  const startTimer = useCallback(() => {
    const target = Date.now() + AUTO_DEPLOY_DELAY_MS;
    startTimerFromTarget(target);
  }, [startTimerFromTarget]);

  // ── Core deploy ─────────────────────────────────────────────────────────────
  const executeDeploy = useCallback(async () => {
    clearTimers();
    setIsDeploying(true);
    await triggerRedeploy();
    setChangesMap(new Map());
    clearAllStorage();
    setIsDeploying(false);

    // Notify other tabs that deploy is done
    try { channelRef.current?.postMessage({ type: "deploy_complete" }); } catch { /* ignore */ }
  }, [clearTimers]);

  // Keep ref fresh every render so setTimeout always calls the current version
  useEffect(() => { executeDeployRef.current = executeDeploy; });

  // ── Rehydrate timer on mount ──────────────────────────────────────────────
  useEffect(() => {
    const persistedTarget = loadPersistedDeployTarget();
    if (persistedTarget && changesMap.size > 0) {
      if (persistedTarget <= Date.now()) {
        // Timer already expired while we were closed — deploy immediately
        console.log("[DeployContext] Persisted timer expired while away — deploying now");
        executeDeployRef.current();
      } else {
        // Resume the countdown from where it left off
        console.log("[DeployContext] Resuming countdown from persisted target");
        startTimerFromTarget(persistedTarget);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // Only run once on mount

  // ── BroadcastChannel listener ─────────────────────────────────────────────
  useEffect(() => {
    channelRef.current = getBroadcastChannel();
    const channel = channelRef.current;

    if (channel) {
      channel.onmessage = (event) => {
        if (event.data?.type === "deploy_complete" || event.data?.type === "changes_cleared") {
          // Another tab deployed or cleared everything — sync our state
          clearTimers();
          setChangesMap(new Map());
          setIsDeploying(false);
        } else if (event.data?.type === "changes_updated") {
          // Another tab updated changes — reload from storage
          setChangesMap(loadPersistedChanges());
          const target = loadPersistedDeployTarget();
          if (target && target > Date.now()) {
            startTimerFromTarget(target);
          }
        }
      };
    }

    return () => {
      channel?.close();
    };
  }, [clearTimers, startTimerFromTarget]);

  // ── markDirty ───────────────────────────────────────────────────────────────
  const markDirty = useCallback((opts: MarkDirtyOptions) => {
    const { changeKey, label, previousValue, currentValue, undoRecipe } = opts;

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
        undoRecipe,
      });
      return next;
    });

    // Start/reset the 5-min timer (only if there will be pending changes)
    startTimer();

    // Notify other tabs
    try { channelRef.current?.postMessage({ type: "changes_updated" }); } catch { /* ignore */ }
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
      await executeUndoRecipe(change.undoRecipe);
    } catch (err) {
      console.error("[DeployContext] undo recipe failed:", err);
      // Un-mark isUndoing on failure
      setChangesMap(prev => {
        const next = new Map(prev);
        const entry = next.get(changeKey);
        if (entry) next.set(changeKey, { ...entry, isUndoing: false });
        return next;
      });
      return;
    }

    // Remove the change — the undo put it back to original, net-zero achieved
    setChangesMap(prev => {
      const next = new Map(prev);
      next.delete(changeKey);
      if (next.size === 0) setTimeout(() => clearTimers(), 0);
      return next;
    });

    // Notify other tabs
    try { channelRef.current?.postMessage({ type: "changes_updated" }); } catch { /* ignore */ }
  }, [changesMap, clearTimers]);

  // ── undoAll ─────────────────────────────────────────────────────────────────
  const undoAll = useCallback(async () => {
    // Run all undo recipes in parallel for speed
    await Promise.allSettled(
      Array.from(changesMap.values()).map(c => executeUndoRecipe(c.undoRecipe))
    );
    clearTimers();
    setChangesMap(new Map());
    clearAllStorage();

    // Notify other tabs
    try { channelRef.current?.postMessage({ type: "changes_cleared" }); } catch { /* ignore */ }
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
