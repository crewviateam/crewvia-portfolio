-- ══════════════════════════════════════════════════════════════════════════════
-- CREWVIA Portfolio — Advanced Analytics Schema (Migration v2)
-- Run this in Supabase SQL Editor AFTER running the original schema.sql
-- ══════════════════════════════════════════════════════════════════════════════

-- ─── Phase 1: UTM Columns on analytics_events ─────────────────────────────────
ALTER TABLE analytics_events
  ADD COLUMN IF NOT EXISTS utm_source   TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium   TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_content  TEXT,
  ADD COLUMN IF NOT EXISTS utm_term     TEXT;

-- Index for UTM campaign performance queries
CREATE INDEX IF NOT EXISTS idx_ae_utm_source   ON analytics_events(utm_source)   WHERE utm_source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ae_utm_campaign ON analytics_events(utm_campaign) WHERE utm_campaign IS NOT NULL;

-- ─── Phase 2: Visitor ID Column on analytics_events ───────────────────────────
ALTER TABLE analytics_events
  ADD COLUMN IF NOT EXISTS visitor_id TEXT;

CREATE INDEX IF NOT EXISTS idx_ae_visitor_id ON analytics_events(visitor_id) WHERE visitor_id IS NOT NULL;

-- ─── Phase 3: Session Scores Table ────────────────────────────────────────────
-- Stores the engagement score per session (0–100). Upserted by api/track.ts
-- after every event batch.
CREATE TABLE IF NOT EXISTS session_scores (
  session_id   TEXT        PRIMARY KEY,
  visitor_id   TEXT,                         -- links to persistent visitor
  score        INTEGER     NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  device_type  TEXT,
  country      TEXT,
  utm_source   TEXT,
  utm_campaign TEXT,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE session_scores ENABLE ROW LEVEL SECURITY;

-- Service role can write (via api/track.ts), authenticated can read (admin dashboard)
CREATE POLICY "Service role can upsert scores"
  ON session_scores FOR ALL TO anon
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can read scores"
  ON session_scores FOR SELECT TO authenticated
  USING (true);

-- Indexes for dashboard queries
CREATE INDEX IF NOT EXISTS idx_ss_score      ON session_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_ss_visitor_id ON session_scores(visitor_id) WHERE visitor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ss_country    ON session_scores(country)    WHERE country IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ss_utm_source ON session_scores(utm_source) WHERE utm_source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ss_updated_at ON session_scores(updated_at DESC);

-- ─── Phase 7: Leads Table ─────────────────────────────────────────────────────
-- Stores emails captured by the lead capture slide-in component.
CREATE TABLE IF NOT EXISTS leads (
  id               BIGSERIAL   PRIMARY KEY,
  email            TEXT        NOT NULL,
  name             TEXT,
  message          TEXT,
  session_id       TEXT,
  visitor_id       TEXT,
  utm_source       TEXT,
  utm_medium       TEXT,
  utm_campaign     TEXT,
  engagement_score INTEGER,                   -- score at time of capture
  page_url         TEXT,
  country          TEXT,
  device_type      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (via api/lead.ts which validates & rate-limits)
CREATE POLICY "Anyone can insert leads"
  ON leads FOR INSERT TO anon
  WITH CHECK (true);

-- Only authenticated (admin) can read
CREATE POLICY "Authenticated can read leads"
  ON leads FOR SELECT TO authenticated
  USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_email      ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_utm_source ON leads(utm_source) WHERE utm_source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_score      ON leads(engagement_score DESC) WHERE engagement_score IS NOT NULL;

-- ─── Phase 10: City Column on analytics_events ────────────────────────────────
ALTER TABLE analytics_events
  ADD COLUMN IF NOT EXISTS city TEXT;

CREATE INDEX IF NOT EXISTS idx_ae_city ON analytics_events(city) WHERE city IS NOT NULL;
