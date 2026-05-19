/**
 * src/pages/ServicesPage.tsx — Full CRUD for services table
 */
import React, { useState } from "react";
import { useCrudTable } from "../hooks/useCrudTable";

interface Service {
  id: string; number: string; title: string; description: string;
  items: string[]; image_url: string; category: string;
  published: boolean; sort_order: number;
}

const BLANK: Partial<Service> = {
  number: "", title: "", description: "", items: [],
  image_url: "", category: "", published: true, sort_order: 99,
};

export default function ServicesPage() {
  const { rows, loading, saving, deploying, error, save, remove } = useCrudTable<Service>("services");
  const [editing,  setEditing]  = useState<Partial<Service> | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const itemsVal = typeof editing.items === "string"
      ? (editing.items as unknown as string).split("\n").map(t => t.trim()).filter(Boolean)
      : editing.items ?? [];
    const ok = await save({ ...editing, items: itemsVal });
    if (ok) setEditing(null);
  };

  return (
    <>
      <div className="admin-header">
        <div>
          <div className="page-title">Services</div>
          <div className="page-sub">{rows.length} services · Edit expertise offerings</div>
        </div>
        <div className="flex items-center gap-12">
          {deploying && <span style={{ fontSize: "12px", color: "var(--teal)" }}>🚀 Deploying…</span>}
          <button className="btn btn-primary" onClick={() => setEditing({ ...BLANK })}>+ Add Service</button>
        </div>
      </div>

      <div className="admin-content">
        {error && <div style={{ color: "var(--red)", marginBottom: "12px", fontSize: "13px" }}>⚠ {error}</div>}
        {loading ? (
          <div className="flex items-center gap-12" style={{ color: "var(--text-dim)", padding: "40px 0" }}>
            <div className="spinner" /> Loading…
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>No.</th><th>Title</th><th>Category</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id}>
                    <td className="td-mono">{s.sort_order}</td>
                    <td><span className="badge badge-teal">{s.number}</span></td>
                    <td className="td-primary">{s.title}</td>
                    <td>{s.category}</td>
                    <td><span className={`badge ${s.published ? "badge-green" : "badge-dim"}`}>{s.published ? "Live" : "Hidden"}</span></td>
                    <td>
                      <div className="flex items-center gap-8">
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditing({ ...s })}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleting(s.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing.id ? "Edit Service" : "New Service"}</h2>
              <button className="modal-close" onClick={() => setEditing(null)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              {[
                { key: "number",   label: "Number (e.g. 01)",  type: "text" },
                { key: "title",    label: "Title",             type: "text" },
                { key: "category", label: "Category Label",    type: "text" },
                { key: "image_url",label: "Image URL",         type: "url"  },
              ].map(({ key, label, type }) => (
                <div key={key} className="form-group">
                  <label className="form-label">{label}</label>
                  <input type={type} className="form-input"
                    value={(editing as Record<string, unknown>)[key] as string ?? ""}
                    onChange={e => setEditing(p => ({ ...p, [key]: e.target.value }))} required />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={editing.description ?? ""}
                  onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Bullet Items (one per line)</label>
                <textarea className="form-textarea" style={{ minHeight: "100px" }}
                  value={Array.isArray(editing.items) ? editing.items.join("\n") : (editing.items ?? "")}
                  onChange={e => setEditing(p => ({ ...p, items: e.target.value as unknown as string[] }))} />
              </div>
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
            <h2 style={{ marginBottom: "12px" }}>Delete Service?</h2>
            <p style={{ color: "var(--text-dim)", marginBottom: "20px" }}>This action cannot be undone and will trigger a site redeploy.</p>
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
