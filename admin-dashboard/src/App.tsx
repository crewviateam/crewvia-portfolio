/**
 * src/App.tsx — Admin router + auth gate
 * Checks Supabase session on mount. If no session → Login.
 * Once authenticated → renders the full admin via Layout + Routes.
 */
import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import Login         from "./components/Login";
import Layout        from "./components/Layout";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProjectsPage  from "./pages/ProjectsPage";
import ServicesPage  from "./pages/ServicesPage";
import TeamPage      from "./pages/TeamPage";
import ProcessPage   from "./pages/ProcessPage";
import ContentPage   from "./pages/ContentPage";

export default function App() {
  const [authed,  setAuthed]  = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setLoading(false);
    });

    // React to auth state changes (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div className="spinner" style={{ width: "20px", height: "20px", borderWidth: "3px" }} />
      </div>
    );
  }

  if (!authed) {
    return <Login onLogin={() => setAuthed(true)} />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index         element={<AnalyticsPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="team"     element={<TeamPage />}     />
        <Route path="process"  element={<ProcessPage />}  />
        <Route path="content"  element={<ContentPage />}  />
        {/* Catch-all → dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
