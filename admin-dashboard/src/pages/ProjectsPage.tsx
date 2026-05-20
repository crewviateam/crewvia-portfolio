/**
 * src/pages/ProjectsPage.tsx — Full CRUD for projects table
 */
import React, { useState } from "react";
import { useCrudTable } from "../hooks/useCrudTable";

interface Project {
  id: string; title: string; category: string; year: string;
  tags: string[]; image_url: string; color: string;
  published: boolean; sort_order: number;
}

const BLANK: Partial<Project> = {
  title: "", category: "", year: new Date().getFullYear().toString(),
  tags: [], image_url: "", color: "#2ec4b6", published: true, sort_order: 99,
};

export default function ProjectsPage() {
  const { rows, loading, saving, error, save, remove } = useCrudTable<Project>("projects");
  const [editing,  setEditing]  = useState<Partial<Project> | null>(null);
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
          <div className="page-title">Projects</div>
          <div className="page-sub">{rows.length} projects · Edit portfolio work</div>
        </div>
        <div className="flex items-center gap-12">

          <button className="btn btn-primary" onClick={() => setEditing({ ...BLANK })}>+ Add Project</button>
        </div>
      </div>

      <div className="admin-content">
        {error && <div style={{ color: "var(--brand-yellow)", marginBottom: "12px", fontSize: "13px" }}>⚠ {error}</div>}

        {loading ? (
          <div className="flex items-center gap-12" style={{ color: "var(--text-dim)", padding: "40px 0" }}>
            <div className="spinner" /> Loading…
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Title</th><th>Category</th><th>Year</th>
                  <th>Tags</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td className="td-mono">{p.sort_order}</td>
                    <td className="td-primary">{p.title}</td>
                    <td>{p.category}</td>
                    <td>{p.year}</td>
                    <td>
                      <div className="tags-wrap">
                        {p.tags?.map(t => <span key={t} className="tag">{t}</span>)}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${p.published ? "badge-green" : "badge-dim"}`}>
                        {p.published ? "Live" : "Hidden"}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-8">
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditing({ ...p })}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleting(p.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing.id ? "Edit Project" : "New Project"}</h2>
              <button className="modal-close" onClick={() => setEditing(null)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              {[
                { key: "title",    label: "Title",       type: "text",   required: true },
                { key: "category", label: "Category",    type: "text",   required: true },
                { key: "year",     label: "Year",        type: "text",   required: true },
                { key: "image_url",label: "Image URL",   type: "url",    required: false },
                { key: "color",    label: "Accent Color",type: "text",   required: false },
                { key: "tags",     label: "Tags (comma-separated)", type: "text", required: false },
              ].map(({ key, label, type, required }) => (
                <div key={key} className="form-group">
                  <label className="form-label">{label}</label>
                  <input
                    type={type}
                    className="form-input"
                    value={key === "tags" ? (editing as Record<string,unknown>)[key]?.toString() ?? "" : (editing as Record<string,unknown>)[key] as string ?? ""}
                    onChange={e => setEditing(prev => ({ ...prev, [key]: e.target.value }))}
                    required={required}
                  />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Sort Order</label>
                <input type="number" className="form-input" value={editing.sort_order ?? 99}
                  onChange={e => setEditing(prev => ({ ...prev, sort_order: Number(e.target.value) }))} />
              </div>
              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input type="checkbox" className="toggle" checked={editing.published ?? true}
                  onChange={e => setEditing(prev => ({ ...prev, published: e.target.checked }))} />
                <label className="form-label" style={{ margin: 0 }}>Published (visible on site)</label>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : "Save & Deploy"}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleting && (
        <div className="modal-backdrop" onClick={() => setDeleting(null)}>
          <div className="modal" style={{ maxWidth: "360px" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: "12px" }}>Delete Project?</h2>
            <p style={{ color: "var(--text-dim)", marginBottom: "20px" }}>
              This will permanently delete the project and trigger a site redeploy.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="btn btn-danger" disabled={saving}
                onClick={async () => { await remove(deleting); setDeleting(null); }}>
                {saving ? "Deleting…" : "Yes, Delete"}
              </button>
              <button className="btn btn-ghost" onClick={() => setDeleting(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
