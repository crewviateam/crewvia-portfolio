/**
 * src/pages/ProcessPage.tsx — Full CRUD for process_steps table
 */
import React, { useState } from "react";
import { useCrudTable } from "../hooks/useCrudTable";

interface ProcessStep {
  id: string; number: string; title: string; description: string; sort_order: number;
}

const BLANK: Partial<ProcessStep> = { number: "", title: "", description: "", sort_order: 99 };

export default function ProcessPage() {
  const { rows, loading, saving, error, save, remove } = useCrudTable<ProcessStep>("process_steps");
  const [editing,  setEditing]  = useState<Partial<ProcessStep> | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const ok = await save(editing);
    if (ok) setEditing(null);
  };

  return (
    <>
      <div className="admin-header">
        <div>
          <div className="page-title">Process Steps</div>
          <div className="page-sub">{rows.length} steps · Edit our work methodology</div>
        </div>
        <div className="flex items-center gap-12">

          <button className="btn btn-primary" onClick={() => setEditing({ ...BLANK })}>+ Add Step</button>
        </div>
      </div>

      <div className="admin-content">
        {error && <div style={{ color: "var(--brand-yellow)", marginBottom: "12px" }}>⚠ {error}</div>}
        {loading ? (
          <div className="flex items-center gap-12" style={{ color: "var(--text-dim)", padding: "40px 0" }}><div className="spinner" /> Loading…</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {rows.map((s) => (
              <div key={s.id} className="card" style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--brand-cyan)", fontFamily: "JetBrains Mono", minWidth: "48px" }}>{s.number}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>{s.title}</div>
                  <div style={{ fontSize: "13px", color: "var(--text-dim)", lineHeight: "1.6" }}>{s.description}</div>
                </div>
                <div className="flex items-center gap-8">
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing({ ...s })}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleting(s.id)}>×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing.id ? "Edit Step" : "New Process Step"}</h2>
              <button className="modal-close" onClick={() => setEditing(null)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Number (e.g. 01)</label>
                <input type="text" className="form-input" value={editing.number ?? ""} onChange={e => setEditing(p => ({ ...p, number: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input type="text" className="form-input" value={editing.title ?? ""} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" style={{ minHeight: "120px" }} value={editing.description ?? ""} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Sort Order</label>
                <input type="number" className="form-input" value={editing.sort_order ?? 99} onChange={e => setEditing(p => ({ ...p, sort_order: Number(e.target.value) }))} />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save & Deploy"}</button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleting && (
        <div className="modal-backdrop" onClick={() => setDeleting(null)}>
          <div className="modal" style={{ maxWidth: "360px" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: "12px" }}>Delete Step?</h2>
            <p style={{ color: "var(--text-dim)", marginBottom: "20px" }}>This cannot be undone.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="btn btn-danger" disabled={saving} onClick={async () => { await remove(deleting); setDeleting(null); }}>{saving ? "Deleting…" : "Yes, Delete"}</button>
              <button className="btn btn-ghost" onClick={() => setDeleting(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
