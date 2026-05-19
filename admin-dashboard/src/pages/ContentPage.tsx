/**
 * src/pages/ContentPage.tsx — Key-value site_content editor
 * Edits all CMS text: hero, manifesto, marquee, footer, etc.
 */
import React, { useEffect, useState } from "react";
import { supabase, triggerRedeploy } from "../lib/supabase";

interface ContentRow { id: string; key: string; value: string; description: string | null; }

const GROUPS: { label: string; keys: string[] }[] = [
  { label: "Hero Section", keys: ["hero_tagline", "hero_description", "hero_available_text", "hero_location"] },
  { label: "Intro Section", keys: ["intro_headline", "intro_body"] },
  { label: "Manifesto",     keys: ["manifesto_headline", "manifesto_statements"] },
  { label: "Marquee",       keys: ["marquee_items"] },
  { label: "Footer",        keys: ["footer_cta_headline", "footer_cta_sub", "footer_email", "footer_phone", "footer_copyright"] },
];

export default function ContentPage() {
  const [rows,      setRows]      = useState<ContentRow[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [editing,   setEditing]   = useState<ContentRow | null>(null);
  const [value,     setValue]     = useState("");
  const [saving,    setSaving]    = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");

  useEffect(() => { fetchRows(); }, []);

  async function fetchRows() {
    setLoading(true);
    const { data, error: e } = await supabase.from("site_content").select("*").order("key");
    if (!e && data) setRows(data as ContentRow[]);
    setLoading(false);
  }

  function openEdit(row: ContentRow) {
    setEditing(row);
    setValue(row.value);
    setError("");
    setSuccess("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");
    const { error: e2 } = await supabase.from("site_content").update({ value }).eq("id", editing.id);
    if (e2) { setError(e2.message); setSaving(false); return; }
    setDeploying(true);
    await triggerRedeploy();
    setDeploying(false);
    setSaving(false);
    setSuccess("Saved and deploy triggered ✓");
    setEditing(null);
    await fetchRows();
  }

  const getRow = (key: string) => rows.find(r => r.key === key);
  const isJson = (key: string) => key.includes("statements") || key.includes("items");

  return (
    <>
      <div className="admin-header">
        <div>
          <div className="page-title">Site Content</div>
          <div className="page-sub">All editable text on the portfolio</div>
        </div>
        {deploying && <span style={{ fontSize: "12px", color: "var(--teal)" }}>🚀 Deploying…</span>}
      </div>

      <div className="admin-content">
        {success && <div className="deploy-bar">✓ {success}</div>}
        {error && <div style={{ color: "var(--red)", marginBottom: "12px" }}>⚠ {error}</div>}

        {loading ? (
          <div className="flex items-center gap-12" style={{ color: "var(--text-dim)", padding: "40px 0" }}><div className="spinner" /> Loading…</div>
        ) : (
          GROUPS.map(({ label, keys }) => (
            <div key={label} style={{ marginBottom: "28px" }}>
              <h3 style={{ marginBottom: "12px", color: "var(--text-dim)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {label}
              </h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Key</th><th>Value</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {keys.map(key => {
                      const row = getRow(key);
                      if (!row) return (
                        <tr key={key}>
                          <td className="td-mono">{key}</td>
                          <td style={{ color: "var(--text-dim)", fontStyle: "italic" }}>not found in DB — run schema.sql</td>
                          <td />
                        </tr>
                      );
                      return (
                        <tr key={key}>
                          <td><span className="td-mono">{key}</span></td>
                          <td style={{ maxWidth: "420px" }}>
                            <div style={{ color: "var(--text-mid)", fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: isJson(key) ? "nowrap" : "normal", maxHeight: isJson(key) ? "1.5em" : "3em", opacity: 0.8 }}>
                              {row.value || <em style={{ color: "var(--text-dim)" }}>empty</em>}
                            </div>
                            {row.description && <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "3px" }}>{row.description}</div>}
                          </td>
                          <td>
                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(row)}>Edit</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}

        {/* Unlisted keys */}
        {!loading && (() => {
          const listed = GROUPS.flatMap(g => g.keys);
          const rest = rows.filter(r => !listed.includes(r.key));
          if (!rest.length) return null;
          return (
            <div style={{ marginBottom: "28px" }}>
              <h3 style={{ marginBottom: "12px", color: "var(--text-dim)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Other</h3>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Key</th><th>Value</th><th>Action</th></tr></thead>
                  <tbody>
                    {rest.map(row => (
                      <tr key={row.key}>
                        <td><span className="td-mono">{row.key}</span></td>
                        <td style={{ color: "var(--text-mid)", fontSize: "13px", maxWidth: "420px" }}>{row.value}</td>
                        <td><button className="btn btn-ghost btn-sm" onClick={() => openEdit(row)}>Edit</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Edit Content</h2>
                <div style={{ fontSize: "12px", color: "var(--teal)", fontFamily: "JetBrains Mono", marginTop: "2px" }}>{editing.key}</div>
              </div>
              <button className="modal-close" onClick={() => setEditing(null)}>×</button>
            </div>
            {editing.description && (
              <div style={{ fontSize: "12px", color: "var(--text-dim)", marginBottom: "14px", padding: "8px 10px", background: "var(--surface)", borderRadius: "4px", borderLeft: "2px solid var(--teal)" }}>
                {editing.description}
              </div>
            )}
            {isJson(editing.key) && (
              <div style={{ fontSize: "12px", color: "var(--amber)", marginBottom: "10px" }}>
                ⚠ This field is a JSON array. Edit carefully — must be valid JSON (e.g. <code>["Item 1","Item 2"]</code>)
              </div>
            )}
            <form onSubmit={handleSave}>
              <div className="form-group">
                <textarea
                  className="form-textarea"
                  style={{ minHeight: isJson(editing.key) ? "140px" : "80px", fontFamily: isJson(editing.key) ? "JetBrains Mono" : "inherit" }}
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  required
                />
              </div>
              {error && <div style={{ color: "var(--red)", marginBottom: "10px", fontSize: "13px" }}>⚠ {error}</div>}
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" className="btn btn-primary" disabled={saving || deploying}>
                  {saving ? "Saving…" : deploying ? "Deploying…" : "Save & Deploy"}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
