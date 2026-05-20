/**
 * src/components/Layout.tsx
 * Admin shell: sidebar navigation + header bar + content outlet.
 */
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const NAV = [
  {
    section: "Analytics",
    items: [
      { to: "/",           icon: "📊", label: "Dashboard"     },
    ],
  },
  {
    section: "Visibility",
    items: [
      { to: "/sections",   icon: "👁️", label: "Sections"      },
    ],
  },
  {
    section: "Content",
    items: [
      { to: "/projects",   icon: "🖼️",  label: "Projects"     },
      { to: "/services",   icon: "⚡",  label: "Services"     },
      { to: "/team",       icon: "👥",  label: "Team"         },
      { to: "/process",    icon: "🔄",  label: "Process"      },
      { to: "/content",    icon: "✏️",  label: "Site Content" },
    ],
  },
];

export default function Layout() {
  const navigate = useNavigate();

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
            <span className="nav-icon">🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}
