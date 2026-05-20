/**
 * src/pages/SectionsPage.tsx
 * Control which portfolio sections are visible or hidden.
 *
 * Each section maps to a site_content key: section_<name>_visible = "true"/"false"
 * Changes are upserted to Supabase and a Vercel redeploy is triggered automatically.
 * The portfolio reads these at build-time via fetchCmsData → siteContent.json.
 */
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useDeploy } from "../context/DeployContext";

interface Section {
  key:         string;   // site_content key, e.g. "section_work_visible"
  label:       string;   // Human label
  description: string;   // Shown below the toggle
  icon:        string;
}

// All controllable portfolio sections — order = display order on page
const SECTIONS: Section[] = [
  {
    key:         "section_hero_visible",
    label:       "Hero",
    description: "Main landing section with headline, CTA, and parallax background.",
    icon:        "🏠",
  },
  {
    key:         "section_intro_visible",
    label:       "Intro",
    description: "3-line animated heading and body paragraph after the hero.",
    icon:        "✨",
  },
  {
    key:         "section_work_visible",
    label:       "Work Gallery",
    description: "Project showcase grid with hover effects.",
    icon:        "🖼️",
  },
  {
    key:         "section_process_visible",
    label:       "Process",
    description: "Numbered step-by-step methodology section.",
    icon:        "🔄",
  },
  {
    key:         "section_manifesto_visible",
    label:       "Manifesto",
    description: "Full-screen rotating brand statement block.",
    icon:        "📣",
  },
  {
    key:         "section_team_visible",
    label:       "Team",
    description: "Team member cards with photos and roles.",
    icon:        "👥",
  },
  {
    key:         "section_services_visible",
    label:       "Services",
    description: "Numbered services accordion with descriptions.",
    icon:        "⚡",
  },
  {
    key:         "section_marquee_visible",
    label:       "Marquee",
    description: "Scrolling ticker strip with brand keywords.",
    icon:        "📰",
  },
];

type VisibilityMap = Record<string, boolean>;

export default function SectionsPage() {
  const [visibility, setVisibility] = useState<VisibilityMap>({});
  const [loading,    setLoading]    = useState(true);
  const [toggling,   setToggling]   = useState<string | null>(null); // key being toggled
  const [success,    setSuccess]    = useState("");
  const [error,      setError]      = useState("");

  const { markDirty } = useDeploy();

  useEffect(() => { fetchVisibility(); }, []);

  async function fetchVisibility() {
    setLoading(true);
    const keys = SECTIONS.map(s => s.key);
    const { data, error: e } = await supabase
      .from("site_content")
      .select("key, value")
      .in("key", keys);

    if (e) {
      console.error("[SectionsPage] fetch error:", e);
      setError(e.message);
    } else {
      const map: VisibilityMap = {};
      // Default all to visible; override with DB value if present
      keys.forEach(k => { map[k] = true; });
      (data ?? []).forEach((row: { key: string; value: string }) => {
        map[row.key] = row.value !== "false";
      });
      setVisibility(map);
    }
    setLoading(false);
  }

  async function toggle(section: Section) {
    const current = visibility[section.key] ?? true;
    const next    = !current;

    setVisibility(prev => ({ ...prev, [section.key]: next }));
    setToggling(section.key);
    setError("");
    setSuccess("");

    const { error: e } = await supabase
      .from("site_content")
      .upsert(
        { key: section.key, value: next ? "true" : "false",
          description: `Controls visibility of the ${section.label} section on the portfolio` },
        { onConflict: "key" }
      );

    if (e) {
      console.error("[SectionsPage] upsert error:", e);
      setError(e.message);
      setVisibility(prev => ({ ...prev, [section.key]: current }));
      setToggling(null);
      return;
    }

    setToggling(null);
    setSuccess(`"${section.label}" set to ${next ? "Visible ✓" : "Hidden ✓"}`);

    const capturedKey     = section.key;
    const capturedLabel   = section.label;
    const capturedCurrent = current; // original value for undo/net-zero

    markDirty({
      changeKey:     `site_content::${capturedKey}`,
      label:         `Section "${capturedLabel}" ${next ? "shown" : "hidden"}`,
      previousValue: capturedCurrent,  // boolean before toggle
      currentValue:  next,             // boolean after toggle
      undoFn: async () => {
        await supabase.from("site_content").upsert(
          { key: capturedKey, value: capturedCurrent ? "true" : "false",
            description: `Controls visibility of the ${capturedLabel} section on the portfolio` },
          { onConflict: "key" }
        );
        // Update optimistic local state
        setVisibility(prev => ({ ...prev, [capturedKey]: capturedCurrent }));
        await fetchVisibility();
      },
    });
  }


  const visibleCount = Object.values(visibility).filter(Boolean).length;

  return (
    <>
      <div className="admin-header">
        <div>
          <div className="page-title">Section Visibility</div>
          <div className="page-sub">
            {loading ? "Loading…" : `${visibleCount} of ${SECTIONS.length} sections visible`}
          </div>
        </div>
      </div>

      <div className="admin-content">
        {success && <div className="deploy-bar">✓ {success}</div>}
        {error   && <div style={{ color: "var(--brand-yellow)", marginBottom: "12px", fontSize: "13px" }}>⚠ {error}</div>}

        <div style={{ marginBottom: "16px", padding: "12px 16px", background: "var(--surface)", borderRadius: "8px", borderLeft: "3px solid var(--brand-cyan)", fontSize: "13px", color: "var(--text-dim)", lineHeight: "1.6" }}>
          Toggling a section triggers a <strong style={{ color: "var(--text)" }}>Vercel redeploy</strong> — changes go live on the portfolio in ~60 seconds.
          Hidden sections are <strong style={{ color: "var(--text)" }}>completely removed</strong> from the HTML at build time (zero JS overhead).
        </div>

        {loading ? (
          <div className="flex items-center gap-12" style={{ color: "var(--text-dim)", padding: "40px 0" }}>
            <div className="spinner" /> Loading visibility settings…
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {SECTIONS.map((section, idx) => {
              const isVisible = visibility[section.key] ?? true;
              const isBusy    = toggling === section.key;

              return (
                <div
                  key={section.key}
                  className="card"
                  style={{
                    display:        "flex",
                    alignItems:     "center",
                    gap:            "16px",
                    padding:        "16px 20px",
                    opacity:        isBusy ? 0.6 : 1,
                    transition:     "opacity 0.2s, border-color 0.2s",
                    borderColor:    isVisible ? "var(--border)" : "rgba(255,255,255,0.04)",
                  }}
                >
                  {/* Order badge */}
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: isVisible ? "var(--brand-cyan)" : "var(--surface)",
                    color: isVisible ? "#000" : "var(--text-dim)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "11px", fontWeight: 700, flexShrink: 0,
                    transition: "background 0.25s, color 0.25s",
                  }}>
                    {String(idx + 1).padStart(2, "0")}
                  </div>

                  {/* Icon */}
                  <div style={{ fontSize: "20px", flexShrink: 0 }}>{section.icon}</div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: 600,
                      color: isVisible ? "var(--text)" : "var(--text-dim)",
                      marginBottom: "3px",
                      transition: "color 0.25s",
                    }}>
                      {section.label}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: "1.4" }}>
                      {section.description}
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className={`badge ${isVisible ? "badge-green" : "badge-dim"}`} style={{ flexShrink: 0 }}>
                    {isBusy ? "Saving…" : isVisible ? "Visible" : "Hidden"}
                  </span>

                  {/* Toggle switch */}
                  <label
                    style={{
                      position:   "relative",
                      display:    "inline-flex",
                      alignItems: "center",
                      cursor:     isBusy ? "not-allowed" : "pointer",
                      flexShrink: 0,
                    }}
                    title={isVisible ? `Hide ${section.label} section` : `Show ${section.label} section`}
                  >
                    <input
                      type="checkbox"
                      checked={isVisible}
                      disabled={isBusy}
                      onChange={() => toggle(section)}
                      style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
                    />
                    {/* Track */}
                    <div style={{
                      width:        "44px",
                      height:       "24px",
                      borderRadius: "12px",
                      background:   isVisible ? "var(--brand-cyan)" : "rgba(255,255,255,0.1)",
                      transition:   "background 0.25s",
                      position:     "relative",
                    }}>
                      {/* Thumb */}
                      <div style={{
                        position:     "absolute",
                        top:          "3px",
                        left:         isVisible ? "23px" : "3px",
                        width:        "18px",
                        height:       "18px",
                        borderRadius: "50%",
                        background:   "#fff",
                        transition:   "left 0.2s",
                        boxShadow:    "0 1px 3px rgba(0,0,0,0.3)",
                      }} />
                    </div>
                  </label>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
