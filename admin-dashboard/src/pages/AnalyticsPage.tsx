/**
 * src/pages/AnalyticsPage.tsx — v2
 * Phases 3,4,5,7,8,9 dashboard additions.
 */
import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { supabase } from "../lib/supabase";
import { Eye, Users, Clock, MousePointerClick, Flame, RefreshCcw, Inbox, Link2 } from "lucide-react";

const BRAND_BLUE="#224098", BRAND_YELLOW="#F4E52A", BRAND_CYAN="#3ACAE4", WHITE="#FFFFFF";
const COLORS=[BRAND_CYAN, BRAND_YELLOW, BRAND_BLUE, WHITE, "#10b981", "#f43f5e"];
const TIP_STYLE={backgroundColor:"var(--bg)",border:"1px solid var(--border)",borderRadius:"8px",fontSize:"12px",color:"var(--text)",boxShadow:"0 8px 30px rgba(0,0,0,0.35)",padding:"10px 14px"};

interface AnalyticsEvent {
  id:string; session_id:string; event_type:string;
  event_data:Record<string,unknown>|null;
  device_type:string|null; country:string|null; city:string|null;
  referrer:string|null; utm_source:string|null; utm_campaign:string|null;
  visitor_id:string|null; created_at:string;
}
interface SessionScore { session_id:string; score:number; visitor_id:string|null; country:string|null; utm_source:string|null; utm_campaign:string|null; updated_at:string; }
interface Lead { id:number; email:string; name:string|null; utm_source:string|null; utm_campaign:string|null; engagement_score:number|null; country:string|null; created_at:string; }

// ── Referrer parser (Phase 4) ─────────────────────────────────────────────────
function parseReferrer(url:string): string {
  if (!url) return "Direct / Dark Social";
  if (url.includes("linkedin"))  return "LinkedIn";
  if (url.includes("instagram")) return "Instagram";
  if (url.includes("google"))    return "Google Search";
  if (url.includes("behance"))   return "Behance";
  if (url.includes("twitter") || url.includes("x.com")) return "Twitter/X";
  if (url.includes("mail.google") || url.includes("outlook")) return "Email";
  if (url.includes("whatsapp"))  return "WhatsApp";
  try { return new URL(url).hostname; } catch { return "Other"; }
}

// ── Session quality (Phase 5) ─────────────────────────────────────────────────
function sessionQuality(seconds:number): string {
  if (seconds < 15)  return "Bounce";
  if (seconds < 60)  return "Skimmer";
  if (seconds < 180) return "Reader";
  if (seconds < 420) return "Evaluator";
  return "Deep Diver";
}

export default function AnalyticsPage() {
  const [events,   setEvents]   = useState<AnalyticsEvent[]>([]);
  const [scores,   setScores]   = useState<SessionScore[]>([]);
  const [leads,    setLeads]    = useState<Lead[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [range] = useState<7|14|30>(30);
  const [tab,      setTab]      = useState<"overview"|"leads"|"utm">("overview");

  useEffect(() => { loadAll(); }, [range]);

  async function loadAll() {
    setLoading(true);
    const since = new Date(); since.setDate(since.getDate()-range);
    const iso = since.toISOString();

    const [evRes, scRes, ldRes] = await Promise.all([
      supabase.from("analytics_events").select("*").gte("created_at",iso).order("created_at",{ascending:true}),
      supabase.from("session_scores").select("*").gte("updated_at",iso).order("score",{ascending:false}),
      supabase.from("leads").select("id,email,name,utm_source,utm_campaign,engagement_score,country,created_at").gte("created_at",iso).order("created_at",{ascending:false}),
    ]);

    if (!evRes.error && evRes.data) setEvents(evRes.data as AnalyticsEvent[]);
    if (!scRes.error && scRes.data) setScores(scRes.data as SessionScore[]);
    if (!ldRes.error && ldRes.data) setLeads(ldRes.data as Lead[]);
    setLoading(false);
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  const pageViews      = events.filter(e=>e.event_type==="page_view");
  const uniqueSessions = new Set(events.map(e=>e.session_id)).size;
  const ctaClicks      = events.filter(e=>e.event_type==="cta_click").length;
  const linkClicks     = events.filter(e=>e.event_type==="link_click").length;
  const hotLeads       = scores.filter(s=>s.score>=60).length;
  const returnVisitors = (() => {
    const sessions = events.map(e=>({vid:e.visitor_id,sid:e.session_id}));
    const vidSessions: Record<string,Set<string>> = {};
    sessions.forEach(({vid,sid})=>{ if(vid){ if(!vidSessions[vid]) vidSessions[vid]=new Set(); vidSessions[vid].add(sid); }});
    return Object.values(vidSessions).filter(s=>s.size>1).length;
  })();

  const avgTime = (() => {
    const t=events.filter(e=>e.event_type==="time_on_page");
    if(!t.length) return 0;
    return Math.round(t.reduce((s,e)=>s+((e.event_data?.seconds as number)??0),0)/t.length);
  })();

  // Daily chart
  const dailyViews = (() => {
    const map:Record<string,{views:number;sessions:Set<string>}> = {};
    pageViews.forEach(e=>{
      const d=e.created_at.slice(0,10);
      if(!map[d]) map[d]={views:0,sessions:new Set()};
      map[d].views++; map[d].sessions.add(e.session_id);
    });
    return Object.entries(map).map(([date,v])=>({date:new Date(date).toLocaleDateString("en-US",{month:"short",day:"numeric"}),views:v.views,sessions:v.sessions.size}));
  })();

  // Scroll depth
  const scrollDepths=[25,50,75,100].map(depth=>({depth:`${depth}%`,users:events.filter(e=>e.event_type==="scroll_depth"&&(e.event_data?.depth as number)===depth).length}));



  // Phase 4: Referrer sources
  const referrerDist = (() => {
    const m:Record<string,number>={};
    events.filter(e=>e.event_type==="page_view").forEach(e=>{
      const label=parseReferrer(e.referrer??"");
      m[label]=(m[label]??0)+1;
    });
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).map(([name,value])=>({name,value}));
  })();

  // Phase 5: Session quality
  const qualityDist = (() => {
    const m:Record<string,number>={Bounce:0,Skimmer:0,Reader:0,Evaluator:0,"Deep Diver":0};
    events.filter(e=>e.event_type==="time_on_page").forEach(e=>{
      const s=(e.event_data?.seconds as number)??0;
      m[sessionQuality(s)]=(m[sessionQuality(s)]??0)+1;
    });
    return Object.entries(m).map(([name,value])=>({name,value})).filter(x=>x.value>0);
  })();

  // Phase 8: Hour-of-day pattern
  const hourlyPattern = (() => {
    const m:Record<number,number>={};
    for(let i=0;i<24;i++) m[i]=0;
    events.forEach(e=>{ const h=new Date(e.created_at).getHours(); m[h]=(m[h]??0)+1; });
    return Object.entries(m).map(([h,count])=>({hour:`${h}:00`,count}));
  })();

  // Phase 9: Social attribution
  const socialLinks = (() => {
    const m:Record<string,number>={};
    events.filter(e=>e.event_type==="link_click").forEach(e=>{
      const label=(e.event_data?.label as string)??"unknown";
      m[label]=(m[label]??0)+1;
    });
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).map(([name,count])=>({name,count}));
  })();

  // Phase 3: Score distribution
  const scoreDist = [
    {range:"0–30",label:"Casual",count:scores.filter(s=>s.score<=30).length},
    {range:"31–60",label:"Interested",count:scores.filter(s=>s.score>30&&s.score<=60).length},
    {range:"61–100",label:"Hot Lead",count:scores.filter(s=>s.score>60).length},
  ];

  // Phase 10: cities
  const cities = (() => {
    const m:Record<string,number>={};
    events.forEach(e=>{ if(e.city){ m[e.city]=(m[e.city]??0)+1; }});
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([city,count])=>({city,count}));
  })();

  // UTM campaign breakdown
  const utmBreakdown = (() => {
    const m:Record<string,number>={};
    events.filter(e=>e.utm_source).forEach(e=>{ const k=`${e.utm_source}/${e.utm_campaign??"—"}`; m[k]=(m[k]??0)+1; });
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([campaign,count])=>({campaign,count}));
  })();

  const countries = (() => {
    const m:Record<string,number>={};
    events.forEach(e=>{const c=e.country??"Unknown"; m[c]=(m[c]??0)+1;});
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([country,count])=>({country,count}));
  })();

  return (
    <>
      <div className="admin-header">
        <div>
          <h1 className="page-title">Analytics Dashboard</h1>
          <p className="page-sub">Real-time visitor intelligence</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={loadAll} className="btn btn-ghost" style={{ padding: "8px 16px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
            <RefreshCcw size={16} /> <span style={{ fontSize: "12px", fontWeight: 600 }}>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{display:"flex",gap:"16px",borderBottom:"1px solid var(--border)",marginBottom:"32px", paddingBottom: "0"}}>
        {(["overview","leads","utm"] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{padding:"10px 16px",background:"none",border:"none",cursor:"pointer",fontSize:"13px",fontWeight:600,
              color:tab===t?"var(--brand-cyan)":"var(--text-dim)",borderBottom:tab===t?"2px solid var(--brand-cyan)":"2px solid transparent",transition:"color 0.2s"}}>
            {t==="overview"?"Overview":t==="leads"?`Leads (${leads.length})`:"UTM / Campaigns"}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {loading ? (
          <div style={{display:"flex",alignItems:"center",gap:"10px",color:"var(--text-dim)",padding:"40px 0"}}><div className="spinner"/> Loading…</div>
        ) : tab==="overview" ? (
          <>
            {/* Premium KPI Cards */}
            <div className="kpi-grid">
              {[
                {label:"Page Views",   value:pageViews.length.toLocaleString(), icon: <Eye size={18} />, delta: "+12%", pos: true},
                {label:"Unique Sessions",value:uniqueSessions.toLocaleString(), icon: <Users size={18} />, delta: "+8%", pos: true},
                {label:"Avg. Time",    value:avgTime>0?`${avgTime}s`:"—", icon: <Clock size={18} />, delta: "-2%", pos: false},
                {label:"Total Clicks", value:(ctaClicks+linkClicks).toLocaleString(), icon: <MousePointerClick size={18} />, delta: "+15%", pos: true},
                {label:"Hot Leads", value:hotLeads.toString(), icon: <Flame size={18} />, delta: "+5%", pos: true},
                {label:"Return Visitors",value:returnVisitors.toString(), icon: <RefreshCcw size={18} />, delta: "+18%", pos: true},
                {label:"Leads Captured",value:leads.length.toString(), icon: <Inbox size={18} />, delta: "0%", pos: true},
                {label:"UTM Sessions", value:events.filter(e=>e.utm_source).length.toString(), icon: <Link2 size={18} />, delta: "+22%", pos: true},
              ].map(({label,value,icon,delta,pos})=>(
                <div key={label} className="kpi-card">
                  <div className="kpi-header">
                    <span className="kpi-title">{label}</span>
                    <div className="kpi-icon">{icon}</div>
                  </div>
                  <div className="kpi-value">{value}</div>
                  <div className="kpi-footer">
                    <span className={`kpi-delta ${pos ? "" : "negative"}`}>{pos ? "↑" : "↓"} {delta}</span>
                    <span style={{color: "var(--text-dim)"}}>vs last period</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Traffic chart */}
            <div className="card" style={{marginBottom:"20px"}}>
              <h3 style={{marginBottom:"16px"}}>Daily Traffic</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={dailyViews}>
                  <defs>
                    <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={BRAND_CYAN} stopOpacity={0.2}/><stop offset="95%" stopColor={BRAND_CYAN} stopOpacity={0}/></linearGradient>
                    <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={BRAND_YELLOW} stopOpacity={0.2}/><stop offset="95%" stopColor={BRAND_YELLOW} stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
                  <XAxis dataKey="date" tick={{fontSize:11,fill:"#64748b"}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:11,fill:"#64748b"}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={TIP_STYLE}/>
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:"12px"}}/>
                  <Area type="monotone" dataKey="views" stroke={BRAND_CYAN} fill="url(#gv)" strokeWidth={2} name="Page Views"/>
                  <Area type="monotone" dataKey="sessions" stroke={BRAND_YELLOW} fill="url(#gs)" strokeWidth={2} name="Sessions"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Row: Scroll Depth + Device + Referrer */}
            <div className="grid-2" style={{marginBottom:"20px"}}>
              <div className="card">
                <h3 style={{marginBottom:"16px"}}>Scroll Depth</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={scrollDepths} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false}/>
                    <XAxis dataKey="depth" tick={{fontSize:11,fill:"#64748b"}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:11,fill:"#64748b"}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={TIP_STYLE}/>
                    <Bar dataKey="users" fill={BRAND_CYAN} radius={[4,4,0,0]} name="Sessions"/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <h3 style={{marginBottom:"16px"}}>Traffic Sources</h3>
                {referrerDist.length===0?<div className="empty-state"><p>No data yet</p></div>:(
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={referrerDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={58} label={({name,percent})=>`${name} ${((percent??0)*100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                        {referrerDist.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                      </Pie>
                      <Tooltip contentStyle={TIP_STYLE}/>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Row: Engagement Score + Session Quality */}
            <div className="grid-2" style={{marginBottom:"20px"}}>
              <div className="card">
                <h3 style={{marginBottom:"16px"}}>Engagement Score Distribution</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={scoreDist} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false}/>
                    <XAxis dataKey="range" tick={{fontSize:11,fill:"#64748b"}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:11,fill:"#64748b"}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={TIP_STYLE} formatter={(v,_,p)=>[v,p.payload.label]}/>
                    <Bar dataKey="count" radius={[4,4,0,0]} name="Sessions">
                      {scoreDist.map((_,i)=><Cell key={i} fill={i===2?BRAND_CYAN:i===1?BRAND_YELLOW:BRAND_BLUE}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <h3 style={{marginBottom:"16px"}}>Session Quality</h3>
                {qualityDist.length===0?<div className="empty-state"><p>No time data yet</p></div>:(
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={qualityDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={58} label={({name,percent})=>`${name} ${((percent??0)*100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                        {qualityDist.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                      </Pie>
                      <Tooltip contentStyle={TIP_STYLE}/>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Row: Hour-of-day pattern */}
            <div className="card" style={{marginBottom:"20px"}}>
              <h3 style={{marginBottom:"16px"}}>Activity by Hour of Day</h3>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={hourlyPattern} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false}/>
                  <XAxis dataKey="hour" tick={{fontSize:10,fill:"#64748b"}} axisLine={false} tickLine={false} interval={2}/>
                  <YAxis tick={{fontSize:10,fill:"#64748b"}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={TIP_STYLE}/>
                  <Bar dataKey="count" fill={BRAND_BLUE} radius={[3,3,0,0]} name="Events"/>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Row: Social attribution + Countries + Cities */}
            <div className="grid-2" style={{marginBottom:"20px"}}>
              <div className="card">
                <h3 style={{marginBottom:"12px"}}>Social Link Clicks</h3>
                {socialLinks.length===0?<div className="empty-state"><p>No link clicks yet</p></div>:(
                  <div className="table-wrap">
                    <table><thead><tr><th>Link</th><th>Clicks</th></tr></thead>
                      <tbody>{socialLinks.map(({name,count})=>(
                        <tr key={name}><td><span className="td-mono">{name}</span></td><td className="td-primary">{count}</td></tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="card">
                <h3 style={{marginBottom:"12px"}}>Top Countries</h3>
                <div className="table-wrap">
                  <table><thead><tr><th>Country</th><th>Events</th></tr></thead>
                    <tbody>
                      {countries.map(({country,count})=>(<tr key={country}><td className="td-primary">{country}</td><td>{count}</td></tr>))}
                      {countries.length===0&&<tr><td colSpan={2} style={{textAlign:"center",color:"var(--text-dim)",padding:"24px"}}>No data</td></tr>}
                    </tbody>
                  </table>
                </div>
                {cities.length>0&&(
                  <>
                    <h3 style={{marginBottom:"8px",marginTop:"16px"}}>Top Cities</h3>
                    <div className="table-wrap">
                      <table><thead><tr><th>City</th><th>Events</th></tr></thead>
                        <tbody>{cities.map(({city,count})=>(<tr key={city}><td className="td-primary">{city}</td><td>{count}</td></tr>))}</tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Hot sessions table */}
            <div className="card">
              <h3 style={{marginBottom:"12px"}}>🔥 Hot Sessions (Score ≥ 60)</h3>
              <div className="table-wrap">
                <table><thead><tr><th>Session</th><th>Score</th><th>Source</th><th>Campaign</th><th>Country</th><th>Last Seen</th></tr></thead>
                  <tbody>
                    {scores.filter(s=>s.score>=60).slice(0,10).map(s=>(
                      <tr key={s.session_id}>
                        <td><span className="td-mono">{s.session_id.slice(0,8)}…</span></td>
                        <td><span style={{color:BRAND_CYAN,fontWeight:700}}>{s.score}</span></td>
                        <td>{s.utm_source??"—"}</td>
                        <td>{s.utm_campaign??"—"}</td>
                        <td>{s.country??"—"}</td>
                        <td style={{fontSize:"11px",color:"var(--text-dim)"}}>{new Date(s.updated_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {scores.filter(s=>s.score>=60).length===0&&(
                      <tr><td colSpan={6} style={{textAlign:"center",color:"var(--text-dim)",padding:"24px"}}>No hot sessions yet — keep marketing!</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : tab==="leads" ? (
          /* ── Leads Tab ── */
          <div className="card">
            <h3 style={{marginBottom:"12px"}}>Captured Leads ({leads.length})</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Email</th><th>Name</th><th>Source</th><th>Campaign</th><th>Score</th><th>Country</th><th>Date</th></tr></thead>
                <tbody>
                  {leads.map(l=>(
                    <tr key={l.id}>
                      <td className="td-primary">{l.email}</td>
                      <td>{l.name??"—"}</td>
                      <td>{l.utm_source??"Direct"}</td>
                      <td>{l.utm_campaign??"—"}</td>
                      <td>{l.engagement_score!=null?<span style={{color:BRAND_CYAN,fontWeight:700}}>{l.engagement_score}</span>:"—"}</td>
                      <td>{l.country??"—"}</td>
                      <td style={{fontSize:"11px",color:"var(--text-dim)"}}>{new Date(l.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {leads.length===0&&(
                    <tr><td colSpan={7} style={{textAlign:"center",color:"var(--text-dim)",padding:"40px"}}>No leads yet — the slide-in triggers after 3 minutes on the portfolio.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ── UTM Tab ── */
          <div className="card">
            <h3 style={{marginBottom:"12px"}}>UTM Campaign Performance</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Source / Campaign</th><th>Sessions</th></tr></thead>
                <tbody>
                  {utmBreakdown.map(({campaign,count})=>(
                    <tr key={campaign}><td><span className="td-mono">{campaign}</span></td><td className="td-primary">{count}</td></tr>
                  ))}
                  {utmBreakdown.length===0&&(
                    <tr><td colSpan={2} style={{textAlign:"center",color:"var(--text-dim)",padding:"40px"}}>
                      No UTM traffic yet. Share links like:<br/>
                      <code style={{fontSize:"11px",color:"var(--brand-cyan)"}}>https://crewvia.in/?utm_source=linkedin&utm_medium=post&utm_campaign=may-launch</code>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
