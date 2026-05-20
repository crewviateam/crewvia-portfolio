/**
 * src/App.tsx — Admin router + auth gate
 * Checks Supabase session on mount. If no session → Login.
 * Once authenticated → renders the full admin via Layout + Routes.
 */
import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import { DeployProvider } from "./context/DeployContext";
import Login         from "./components/Login";
import Layout        from "./components/Layout";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProjectsPage  from "./pages/ProjectsPage";
import ServicesPage  from "./pages/ServicesPage";
import TeamPage      from "./pages/TeamPage";
import ProcessPage   from "./pages/ProcessPage";
import ContentPage   from "./pages/ContentPage";
import SectionsPage  from "./pages/SectionsPage";

export default function App() {
  const [authed,  setAuthed]  = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setLoading(false);
    });

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

  // DeployProvider wraps all authenticated pages so every page can call
  // useDeploy() and the shared DeployBanner renders from Layout.
  return (
    <DeployProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index           element={<AnalyticsPage />} />
          <Route path="sections" element={<SectionsPage />}  />
          <Route path="projects" element={<ProjectsPage />}  />
          <Route path="services" element={<ServicesPage />}  />
          <Route path="team"     element={<TeamPage />}      />
          <Route path="process"  element={<ProcessPage />}   />
          <Route path="content"  element={<ContentPage />}   />
          <Route path="*"        element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </DeployProvider>
  );
}
