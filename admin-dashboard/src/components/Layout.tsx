/**
 * src/components/Layout.tsx
 * Admin shell: sidebar navigation + header bar + content outlet.
 */
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import DeployBanner from "./DeployBanner";
import { BarChart3, LayoutDashboard, LayoutTemplate, Layers, Users, RefreshCw, FileText, LogOut, Sun, Moon } from "lucide-react";

const NAV = [
  {
    section: "Analytics",
    items: [
      { to: "/",           icon: <BarChart3 size={18} strokeWidth={2.5} />, label: "Dashboard"     },
    ],
  },
  {
    section: "Visibility",
    items: [
      { to: "/sections",   icon: <LayoutDashboard size={18} strokeWidth={2.5} />, label: "Sections"      },
    ],
  },
  {
    section: "Content",
    items: [
      { to: "/projects",   icon: <LayoutTemplate size={18} strokeWidth={2.5} />,  label: "Projects"     },
      { to: "/services",   icon: <Layers size={18} strokeWidth={2.5} />,  label: "Services"     },
      { to: "/team",       icon: <Users size={18} strokeWidth={2.5} />,  label: "Team"         },
      { to: "/process",    icon: <RefreshCw size={18} strokeWidth={2.5} />,  label: "Process"      },
      { to: "/content",    icon: <FileText size={18} strokeWidth={2.5} />,  label: "Site Content" },
    ],
  },
];

export default function Layout() {
  const navigate = useNavigate();
  const [theme, setTheme] = React.useState<"dark" | "light">("dark");

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="admin-shell">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <div className="brand">CREWVIA</div>
          <div className="sub">Admin CMS</div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ section, items }) => (
            <React.Fragment key={section}>
              <div className="sidebar-section">{section}</div>
              {items.map(({ to, icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
                >
                  <span className="nav-icon">{icon}</span>
                  {label}
                </NavLink>
              ))}
            </React.Fragment>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="nav-item"
            style={{ width: "100%", background: "none", border: "none", cursor: "pointer" }}
          >
            <span className="nav-icon"><LogOut size={18} strokeWidth={2.5} /></span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="top-header" style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 40px", borderBottom: "1px solid var(--border)", background: "var(--surface)",
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", position: "sticky", top: 0, zIndex: 50,
          height: "72px"
        }}>
          {/* Left side: Search / Breadcrumbs (Placeholder for now) */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-dim)", fontSize: "14px", fontWeight: 500 }}>
             <span style={{color: "var(--text)"}}>Crewvia</span> / <span style={{color: "var(--brand-cyan)"}}>Workspace</span>
          </div>
          
          {/* Right side: Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Date Range</span>
              <select className="form-select" style={{ width: "140px", padding: "6px 12px", borderRadius: "6px", fontWeight: 500, fontSize: "12px" }}>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>This Year</option>
                <option>All Time</option>
              </select>
            </div>
            
            <div style={{ width: "1px", height: "24px", background: "var(--border)" }}></div>
            
            <label className="theme-toggle" style={{display: "flex", alignItems: "center", cursor: "pointer", gap: "8px", color: "var(--text-mid)"}}>
              {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
              <input type="checkbox" className="toggle" checked={theme === "light"} onChange={toggleTheme} />
            </label>
            
            <div style={{ width: "1px", height: "24px", background: "var(--border)" }}></div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--brand-blue)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "12px" }}>
                A
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", lineHeight: 1.2 }}>Admin</span>
                <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>admin@crewvia.in</span>
              </div>
            </div>
          </div>
        </header>

        <div className="content-outlet">
          <Outlet />
        </div>
      </div>

      {/* Sticky deploy banner — visible whenever there are pending changes */}
      <DeployBanner />
    </div>
  );
}
