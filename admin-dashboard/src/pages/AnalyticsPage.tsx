/**
 * src/pages/AnalyticsPage.tsx
 * Real-time analytics dashboard with recharts.
 * Queries the analytics_events table in Supabase.
 */
import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { supabase } from "../lib/supabase";

const TEAL  = "#2ec4b6";
const LIME  = "#d4e157";
const BLUE  = "#6366f1";
const PINK  = "#ec4899";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Event {
  id: string;
  session_id: string;
  event_type: string;
  event_data: Record<string, unknown> | null;
  device_type: string | null;
  country: string | null;
  created_at: string;
}

interface DailyView { date: string; views: number; sessions: number; }
interface DeviceDist { name: string; value: number; }
interface EventCount { event: string; count: number; }

const COLORS = [TEAL, LIME, BLUE, PINK, "#f59e0b", "#22c55e"];

// ─── Component ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [events,       setEvents]       = useState<Event[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [range,        setRange]        = useState<7 | 14 | 30>(30);

  useEffect(() => {
    fetchEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  async function fetchEvents() {
    setLoading(true);
    const since = new Date();
    since.setDate(since.getDate() - range);

    const { data, error } = await supabase
      .from("analytics_events")
      .select("*")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true });

    if (!error && data) setEvents(data as Event[]);
    setLoading(false);
  }

  // ── Computed metrics ──────────────────────────────────────────────────────
  const pageViews     = events.filter(e => e.event_type === "page_view");
  const uniqueSessions = new Set(events.map(e => e.session_id)).size;
  const ctaClicks     = events.filter(e => e.event_type === "cta_click").length;
  const linkClicks    = events.filter(e => e.event_type === "link_click").length;

  const avgTime = (() => {
    const timeEvents = events.filter(e => e.event_type === "time_on_page");
    if (!timeEvents.length) return 0;
    const total = timeEvents.reduce((sum, e) => sum + ((e.event_data?.seconds as number) ?? 0), 0);
    return Math.round(total / timeEvents.length);
  })();

  // Daily page views
  const dailyViews: DailyView[] = (() => {
    const map: Record<string, { views: number; sessions: Set<string> }> = {};
    pageViews.forEach(e => {
      const day = e.created_at.slice(0, 10);
      if (!map[day]) map[day] = { views: 0, sessions: new Set() };
      map[day].views++;
      map[day].sessions.add(e.session_id);
    });
    return Object.entries(map).map(([date, v]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      views: v.views,
      sessions: v.sessions.size,
    }));
  })();

  // Device breakdown
  const deviceDist: DeviceDist[] = (() => {
    const map: Record<string, number> = {};
    events.forEach(e => {
      const d = e.device_type ?? "unknown";
      map[d] = (map[d] ?? 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();

  // Event type breakdown
  const eventCounts: EventCount[] = (() => {
    const map: Record<string, number> = {};
    events.forEach(e => { map[e.event_type] = (map[e.event_type] ?? 0) + 1; });
    return Object.entries(map)
      .map(([event, count]) => ({ event, count }))
      .sort((a, b) => b.count - a.count);
  })();

  // Scroll depth
  const scrollDepths = [25, 50, 75, 100].map(depth => ({
    depth: `${depth}%`,
    users: events.filter(e => e.event_type === "scroll_depth" && (e.event_data?.depth as number) === depth).length,
  }));

  // Country breakdown (top 6)
  const countries = (() => {
    const map: Record<string, number> = {};
    events.forEach(e => { const c = e.country ?? "Unknown"; map[c] = (map[c] ?? 0) + 1; });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([country, count]) => ({ country, count }));
  })();

  const tooltipStyle = {
    backgroundColor: "#141414",
    border: "1px solid #2a2a2a",
    borderRadius: "6px",
    fontSize: "12px",
    color: "#e8e8e8",
  };

  return (
    <>
      {/* Header */}
      <div className="admin-header">
        <div>
          <div className="page-title">Analytics Dashboard</div>
          <div className="page-sub">Real-time visitor insights</div>
        </div>
        <div className="flex items-center gap-8">
          {[7, 14, 30].map(d => (
            <button
              key={d}
              onClick={() => setRange(d as 7 | 14 | 30)}
              className={`btn btn-sm ${range === d ? "btn-primary" : "btn-ghost"}`}
            >
              {d}d
            </button>
          ))}
          <button onClick={fetchEvents} className="btn btn-ghost btn-sm">↻ Refresh</button>
        </div>
      </div>

      <div className="admin-content">
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-dim)", padding: "40px 0" }}>
            <div className="spinner" /> Loading analytics data…
          </div>
        ) : (
          <>
            {/* ── Stat Cards ── */}
            <div className="grid-4" style={{ marginBottom: "24px" }}>
              <div className="stat-card">
                <div className="stat-value">{pageViews.length.toLocaleString()}</div>
                <div className="stat-label">Page Views</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{uniqueSessions.toLocaleString()}</div>
                <div className="stat-label">Unique Sessions</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{avgTime > 0 ? `${avgTime}s` : "—"}</div>
                <div className="stat-label">Avg. Time on Page</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{(ctaClicks + linkClicks).toLocaleString()}</div>
                <div className="stat-label">Total Clicks</div>
              </div>
            </div>

            {/* ── Page Views Chart ── */}
            <div className="card" style={{ marginBottom: "20px" }}>
              <h3 style={{ marginBottom: "20px" }}>Daily Page Views & Sessions</h3>
              {dailyViews.length === 0 ? (
                <div className="empty-state"><div className="icon">📈</div><p>No data yet for this period</p></div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={dailyViews}>
                    <defs>
                      <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={TEAL} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={LIME} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={LIME} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b6b6b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#6b6b6b" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
                    <Area type="monotone" dataKey="views"    stroke={TEAL} fill="url(#gv)" strokeWidth={2} name="Page Views" />
                    <Area type="monotone" dataKey="sessions" stroke={LIME} fill="url(#gs)" strokeWidth={2} name="Sessions" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* ── Row 2: Scroll Depth + Device ── */}
            <div className="grid-2" style={{ marginBottom: "20px" }}>
              <div className="card">
                <h3 style={{ marginBottom: "20px" }}>Scroll Depth</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={scrollDepths} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
                    <XAxis dataKey="depth" tick={{ fontSize: 11, fill: "#6b6b6b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#6b6b6b" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="users" fill={TEAL} radius={[4, 4, 0, 0]} name="Users" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <h3 style={{ marginBottom: "20px" }}>Device Breakdown</h3>
                {deviceDist.length === 0 ? (
                  <div className="empty-state"><p>No data</p></div>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={deviceDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                        {deviceDist.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* ── Row 3: Event breakdown + Countries ── */}
            <div className="grid-2">
              <div className="card">
                <h3 style={{ marginBottom: "16px" }}>Event Breakdown</h3>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Event Type</th><th>Count</th></tr>
                    </thead>
                    <tbody>
                      {eventCounts.map(({ event, count }) => (
                        <tr key={event}>
                          <td><span className="td-mono">{event}</span></td>
                          <td className="td-primary">{count.toLocaleString()}</td>
                        </tr>
                      ))}
                      {eventCounts.length === 0 && (
                        <tr><td colSpan={2} style={{ textAlign: "center", color: "var(--text-dim)", padding: "24px" }}>No events yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card">
                <h3 style={{ marginBottom: "16px" }}>Top Countries</h3>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Country</th><th>Events</th></tr>
                    </thead>
                    <tbody>
                      {countries.map(({ country, count }) => (
                        <tr key={country}>
                          <td className="td-primary">{country}</td>
                          <td>{count.toLocaleString()}</td>
                        </tr>
                      ))}
                      {countries.length === 0 && (
                        <tr><td colSpan={2} style={{ textAlign: "center", color: "var(--text-dim)", padding: "24px" }}>No data yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
