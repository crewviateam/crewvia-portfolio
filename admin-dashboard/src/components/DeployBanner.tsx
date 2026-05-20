/**
 * src/components/DeployBanner.tsx — v2
 *
 * Sticky bottom-right deploy banner with:
 *   - Live mm:ss countdown to auto-deploy
 *   - Expandable change log with individual ↩ Undo buttons
 *   - "Undo All" to revert every pending change at once
 *   - "Deploy Now" to skip the wait
 *   - Shimmer progress bar while deploying
 *   - Disappears automatically when all changes are undone or deployed
 */
import { useState } from "react";
import { useDeploy } from "../context/DeployContext";

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function DeployBanner() {
  const { isDirty, isDeploying, countdown, pendingChanges, deployNow, undoChange, undoAll } = useDeploy();
  const [expanded, setExpanded] = useState(false);
  const [undoingAll, setUndoingAll] = useState(false);

  if (!isDirty && !isDeploying) return null;

  const anyUndoing = pendingChanges.some(c => c.isUndoing) || undoingAll;

  async function handleUndoAll() {
    setUndoingAll(true);
    await undoAll();
    setUndoingAll(false);
  }

  return (
    <div style={{
      position:     "fixed",
      bottom:       "24px",
      right:        "24px",
      zIndex:       1000,
      width:        "340px",
      background:   "var(--surface)",
      border:       "1px solid var(--border-hover)",
      borderRadius: "12px",
      boxShadow:    "0 8px 32px rgba(0,0,0,0.55)",
      overflow:     "hidden",
      animation:    "bannerUp 0.35s cubic-bezier(0.19,1,0.22,1) both",
      fontFamily:   "inherit",
    }}>
      {/* ── Header ── */}
      <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Pulsing status dot */}
        <span style={{
          width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
          background: isDeploying ? "var(--brand-yellow)" : "var(--brand-cyan)",
          animation: "pulse 1.4s ease-in-out infinite",
        }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {isDeploying ? (
            <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--brand-yellow)" }}>
              🚀 Deploying to Vercel…
            </div>
          ) : (
            <>
              <div style={{ fontWeight: 600, fontSize: "13px", color: "#f0f0f0" }}>
                {pendingChanges.length} pending change{pendingChanges.length !== 1 ? "s" : ""}
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "1px" }}>
                Auto-deploy in{" "}
                <span style={{ color: "var(--brand-cyan)", fontWeight: 700, fontFamily: "monospace" }}>
                  {fmt(countdown)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Expand/collapse toggle */}
        {!isDeploying && (
          <button onClick={() => setExpanded(p => !p)} title={expanded ? "Collapse" : "Show changes"}
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", fontSize: "15px", padding: "2px 4px", flexShrink: 0 }}>
            {expanded ? "▾" : "▸"}
          </button>
        )}
      </div>

      {/* ── Expanded change list with per-change undo ── */}
      {expanded && !isDeploying && pendingChanges.length > 0 && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", maxHeight: "200px", overflowY: "auto" }}>
          {pendingChanges.map(change => (
            <div key={change.changeKey} style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "7px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.03)",
            }}>
              <span style={{ color: "var(--brand-cyan)", fontSize: "9px", flexShrink: 0 }}>●</span>
              <span style={{
                flex: 1, fontSize: "12px", color: "rgba(255,255,255,0.55)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {change.label}
              </span>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.22)", flexShrink: 0, fontFamily: "monospace" }}>
                {new Date(change.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              {/* Per-change undo button */}
              <button
                onClick={() => undoChange(change.changeKey)}
                disabled={change.isUndoing || anyUndoing}
                title="Undo this change"
                style={{
                  flexShrink: 0, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "4px", padding: "3px 7px", color: change.isUndoing ? "var(--brand-yellow)" : "var(--text-dim)",
                  fontSize: "11px", cursor: change.isUndoing ? "not-allowed" : "pointer", transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {change.isUndoing ? "↩…" : "↩ Undo"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Action buttons ── */}
      {!isDeploying && (
        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: "8px" }}>
          {/* Undo All */}
          <button
            onClick={handleUndoAll}
            disabled={anyUndoing}
            style={{
              flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "7px", padding: "8px 10px", color: anyUndoing ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.6)",
              fontWeight: 600, fontSize: "12px", cursor: anyUndoing ? "not-allowed" : "pointer", transition: "all 0.15s",
            }}
            onMouseOver={e => { if (!anyUndoing) e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            onMouseOut={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
          >
            {undoingAll ? "Undoing…" : "↩ Undo All"}
          </button>

          {/* Deploy Now */}
          <button
            onClick={() => deployNow()}
            disabled={anyUndoing}
            style={{
              flex: 2, background: anyUndoing ? "var(--surface)" : "var(--brand-cyan)",
              border: "none", borderRadius: "7px", padding: "8px 12px",
              color: anyUndoing ? "var(--text-dim)" : "var(--text)",
              fontWeight: 700, fontSize: "12px", cursor: anyUndoing ? "not-allowed" : "pointer",
              letterSpacing: "0.04em", transition: "opacity 0.15s",
            }}
            onMouseOver={e => { if (!anyUndoing) e.currentTarget.style.opacity = "0.85"; }}
            onMouseOut={e => { e.currentTarget.style.opacity = "1"; }}
          >
            🚀 Deploy Now
          </button>
        </div>
      )}

      {/* Shimmer progress bar while deploying */}
      {isDeploying && (
        <div style={{ height: "3px", background: "rgba(255,255,255,0.06)" }}>
          <div style={{
            height: "100%",
            background: "linear-gradient(90deg, var(--brand-cyan), var(--brand-yellow), var(--brand-cyan))",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s linear infinite",
          }} />
        </div>
      )}

      <style>{`
        @keyframes bannerUp {
          from { opacity:0; transform:translateY(16px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes pulse {
          0%,100% { opacity:1; }
          50%      { opacity:0.35; }
        }
        @keyframes shimmer {
          0%   { background-position:200% 0; }
          100% { background-position:-200% 0; }
        }
      `}</style>
    </div>
  );
}
