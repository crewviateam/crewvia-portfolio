/**
 * src/pages/TeamPage.tsx — Full CRUD for team_members table
 */
import React, { useState } from "react";
import { useCrudTable } from "../hooks/useCrudTable";

interface TeamMember {
  id: string; name: string; role: string; image_url: string;
  tags: string[]; published: boolean; sort_order: number;
}

const BLANK: Partial<TeamMember> = {
  name: "", role: "", image_url: "", tags: [], published: true, sort_order: 99,
};

export default function TeamPage() {
  const { rows, loading, saving, error, save, remove } = useCrudTable<TeamMember>("team_members");
  const [editing,  setEditing]  = useState<Partial<TeamMember> | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const tagsVal = typeof editing.tags === "string"
      ? (editing.tags as unknown as string).split(",").map(t => t.trim()).filter(Boolean)
      : editing.tags ?? [];
    const ok = await save({ ...editing, tags: tagsVal });
    if (ok) setEditing(null);
  };

  return (
    <>
      <div className="admin-header">
        <div>
          <div className="page-title">Team</div>
          <div className="page-sub">{rows.length} members</div>
        </div>
        <div className="flex items-center gap-12">

          <button className="btn btn-primary" onClick={() => setEditing({ ...BLANK })}>+ Add Member</button>
        </div>
      </div>

      <div className="admin-content">
        {error && <div style={{ color: "var(--brand-yellow)", marginBottom: "12px" }}>⚠ {error}</div>}
        {loading ? (
          <div className="flex items-center gap-12" style={{ color: "var(--text-dim)", padding: "40px 0" }}><div className="spinner" /> Loading…</div>
        ) : (
          <div className="grid-3">
            {rows.map((m) => (
              <div key={m.id} className="card">
                {m.image_url && <img src={m.image_url} alt={m.name} style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "6px", marginBottom: "14px" }} />}
                <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>{m.name}</div>
                <div style={{ fontSize: "12px", color: "var(--text-dim)", marginBottom: "10px" }}>{m.role}</div>
                <div className="tags-wrap" style={{ marginBottom: "12px" }}>
                  {m.tags?.map(t => <span key={t} className="tag">{t}</span>)}
                </div>
                <div className="flex items-center gap-8">
                  <span className={`badge ${m.published ? "badge-green" : "badge-dim"}`}>{m.published ? "Live" : "Hidden"}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing({ ...m })}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleting(m.id)}>×</button>
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
              <h2>{editing.id ? "Edit Member" : "New Member"}</h2>
              <button className="modal-close" onClick={() => setEditing(null)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              {[
                { key: "name", label: "Name" },
                { key: "role", label: "Role / Title" },
                { key: "image_url", label: "Photo URL" },
                { key: "tags", label: "Tags (comma-separated)" },
              ].map(({ key, label }) => (
                <div key={key} className="form-group">
                  <label className="form-label">{label}</label>
                  <input type="text" className="form-input"
                    value={(editing as Record<string,unknown>)[key]?.toString() ?? ""}
                    onChange={e => setEditing(p => ({ ...p, [key]: e.target.value }))}
                    required={key !== "tags"} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Sort Order</label>
                <input type="number" className="form-input" value={editing.sort_order ?? 99}
                  onChange={e => setEditing(p => ({ ...p, sort_order: Number(e.target.value) }))} />
              </div>
              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input type="checkbox" className="toggle" checked={editing.published ?? true}
                  onChange={e => setEditing(p => ({ ...p, published: e.target.checked }))} />
                <label className="form-label" style={{ margin: 0 }}>Published</label>
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
            <h2 style={{ marginBottom: "12px" }}>Remove Member?</h2>
            <p style={{ color: "var(--text-dim)", marginBottom: "20px" }}>This cannot be undone.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="btn btn-danger" disabled={saving} onClick={async () => { await remove(deleting); setDeleting(null); }}>{saving ? "Removing…" : "Yes, Remove"}</button>
              <button className="btn btn-ghost" onClick={() => setDeleting(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
