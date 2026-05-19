-- ══════════════════════════════════════════════════════════════════════════════
-- CREWVIA Portfolio — Supabase Database Schema
-- Version: 1.0.0
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query → Run)
-- ══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper: auto-update updated_at timestamp
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ══════════════════════════════════════════════════════════════════════════════
-- CONTENT TABLES
-- ══════════════════════════════════════════════════════════════════════════════

-- ─── projects ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title       TEXT        NOT NULL,
  category    TEXT        NOT NULL,
  year        TEXT        NOT NULL,
  tags        TEXT[]      NOT NULL DEFAULT '{}',
  image_url   TEXT        NOT NULL,
  color       TEXT        NOT NULL DEFAULT '#2ec4b6',
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  published   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ─── services ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  number      TEXT        NOT NULL,        -- "01", "02", etc.
  title       TEXT        NOT NULL,
  description TEXT        NOT NULL,
  items       TEXT[]      NOT NULL DEFAULT '{}',
  image_url   TEXT        NOT NULL,
  category    TEXT        NOT NULL,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  published   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ─── team_members ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
  id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name        TEXT        NOT NULL,
  role        TEXT        NOT NULL,
  image_url   TEXT        NOT NULL,
  tags        TEXT[]      NOT NULL DEFAULT '{}',
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  published   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ─── process_steps ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS process_steps (
  id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  number      TEXT        NOT NULL,        -- "01", "02", etc.
  title       TEXT        NOT NULL,
  description TEXT        NOT NULL,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER process_steps_updated_at
  BEFORE UPDATE ON process_steps
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ─── site_content ─────────────────────────────────────────────────────────────
-- Key-value store for all free-text content in the portfolio.
-- Keys are snake_case identifiers consumed by components.
CREATE TABLE IF NOT EXISTS site_content (
  key         TEXT        PRIMARY KEY,
  value       TEXT        NOT NULL,
  description TEXT,                        -- human-readable hint for CMS editors
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Seed the site_content table with default values
INSERT INTO site_content (key, value, description) VALUES
  ('hero_tagline',              '"Creative Freedom, United Crew — we craft bold brands, immersive experiences, and world-class campaigns."',
                                 'Hero section blockquote text'),
  ('hero_available_text',       'Taking on new projects',
                                 'Status badge text in the top-right of the hero'),
  ('hero_location_text',        'Global · Remote',
                                 'Location text in the top-right of the hero'),
  ('intro_heading_line1',       'We <em>don''t just</em> craft',
                                 'First line of the Intro section heading'),
  ('intro_heading_line2',       '<span class="stroke-text">Creative</span> Campaigns.',
                                 'Second line of the Intro section heading'),
  ('intro_heading_line3',       'We <em>build</em> Legacies.',
                                 'Third line of the Intro section heading'),
  ('intro_body',                'In the age of templates, creative freedom is currency. We strip away the non-essential to reveal the raw, beating heart of your brand — and unite a crew to bring it to life.',
                                 'Intro section body paragraph'),
  ('manifesto_statements',      '["Creative Freedom.","United Crew.","We reject the ordinary.","Bold is our baseline.","Your vision. Our crew."]',
                                 'JSON array of manifesto rotator statements'),
  ('marquee_items',             '[{"text":"Branding","outline":true},{"text":"Direction","outline":false},{"text":"Film","outline":true},{"text":"Web","outline":false},{"text":"Marketing","outline":true},{"text":"Identity","outline":false}]',
                                 'JSON array of marquee items. Each: { text: string, outline: boolean }'),
  ('footer_cta_heading',        'Have a project in mind?',
                                 'Footer CTA heading text above LET''S BUILD link'),
  ('footer_description',        'Creative Freedom, United Crew. A global creative studio specialising in brand identity, immersive web, film, and campaigns.',
                                 'Footer brand description paragraph'),
  ('footer_copyright',          '© 2025 CREWVIA • Creative Freedom, United Crew',
                                 'Footer copyright line'),
  ('services_tagline',          'Comprehensive creative solutions for forward-thinking brands — from strategy to screen.',
                                 'Services section subtitle paragraph'),
  ('process_subtitle',          'Our methodology is a blend of rigorous strategy and unbridled creativity.',
                                 'Process section subtitle paragraph')
ON CONFLICT (key) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- ANALYTICS TABLE
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS analytics_events (
  id           BIGSERIAL   PRIMARY KEY,
  session_id   TEXT        NOT NULL,
  -- Event types: page_view | section_view | scroll_depth | time_on_page |
  --              link_click | cta_click | project_hover
  event_type   TEXT        NOT NULL,
  event_data   JSONB,                       -- flexible payload per event_type
  referrer     TEXT,
  user_agent   TEXT,
  country      TEXT,                        -- derived from CF-IPCountry by edge fn
  device_type  TEXT,                        -- 'desktop' | 'mobile' | 'tablet'
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes — optimise the analytics dashboard queries
CREATE INDEX IF NOT EXISTS idx_ae_event_type  ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ae_session_id  ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_ae_created_at  ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ae_country     ON analytics_events(country);
CREATE INDEX IF NOT EXISTS idx_ae_device      ON analytics_events(device_type);

-- ══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE projects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE services         ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_steps    ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content     ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- ─── Content tables: anyone can read published rows ──────────────────────────
CREATE POLICY "Public can read published projects"
  ON projects FOR SELECT TO anon
  USING (published = true);

CREATE POLICY "Authenticated can manage projects"
  ON projects FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Public can read published services"
  ON services FOR SELECT TO anon
  USING (published = true);

CREATE POLICY "Authenticated can manage services"
  ON services FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Public can read published team_members"
  ON team_members FOR SELECT TO anon
  USING (published = true);

CREATE POLICY "Authenticated can manage team_members"
  ON team_members FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Public can read process_steps"
  ON process_steps FOR SELECT TO anon
  USING (true);

CREATE POLICY "Authenticated can manage process_steps"
  ON process_steps FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Public can read site_content"
  ON site_content FOR SELECT TO anon
  USING (true);

CREATE POLICY "Authenticated can manage site_content"
  ON site_content FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ─── Analytics: anyone can insert (via edge fn), only authenticated can read ─
CREATE POLICY "Service role can insert analytics"
  ON analytics_events FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated can read analytics"
  ON analytics_events FOR SELECT TO authenticated
  USING (true);

-- ══════════════════════════════════════════════════════════════════════════════
-- SEED DATA (mirrors current src/data/*.ts files)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO projects (id, title, category, year, tags, image_url, color, sort_order) VALUES
  ('p1', 'Aeon',    'Immersive',   '2024', ARRAY['Motion','3D','Web'],                  'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=800&q=75&fm=webp', '#2ec4b6', 1),
  ('p2', 'Mono',    'Identity',    '2023', ARRAY['Brand','Logo','Print'],               'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=75&fm=webp', '#d4e157', 2),
  ('p3', 'Nebula',  'Web',         '2024', ARRAY['React','GSAP','Three.js'],            'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=75&fm=webp', '#2ec4b6', 3),
  ('p4', 'Kinetic', 'Motion',      '2023', ARRAY['After Effects','Cinema 4D'],          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=75&fm=webp', '#d4e157', 4),
  ('p5', 'Dust',    'CGI',         '2022', ARRAY['Blender','Houdini'],                  'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&w=800&q=75&fm=webp', '#2ec4b6', 5),
  ('p6', 'Void',    'Experiential','2023', ARRAY['Projection','AR','Installation'],     'https://images.unsplash.com/photo-1515462277126-2dd0c162007a?auto=format&fit=crop&w=800&q=75&fm=webp', '#d4e157', 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, number, title, description, items, image_url, category, sort_order) VALUES
  ('s1', '01', 'Brand Identity',  'Strategy-led identity systems that make your brand unmistakable.',          ARRAY['Logo Design','Visual Language','Brand Guidelines','Positioning'],             'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&q=75&fm=webp', 'Strategy',    1),
  ('s2', '02', 'Art Direction',   'Bold visual narratives that command attention across every medium.',         ARRAY['Photography Direction','Set Design','Retouching','Campaign Visuals'],         'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=75&fm=webp', 'Design',       2),
  ('s3', '03', 'Film Production', 'Cinematic content that moves audiences and drives culture.',                 ARRAY['Brand Films','Campaign Videos','Documentary','Motion Graphics'],              'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=75&fm=webp', 'Content',      3),
  ('s4', '04', 'Immersive Web',   'Digital experiences that feel alive — not just functional.',                ARRAY['WebGL / Three.js','GSAP Animations','React / Next.js','Performance Optimisation'],'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=75&fm=webp', 'Development',  4),
  ('s5', '05', 'Campaigns',       'Full-funnel creative campaigns that build brands and drive results.',        ARRAY['Strategy','Creative Concept','Media Planning','Execution'],                   'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=75&fm=webp', 'Marketing',    5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO team_members (id, name, role, image_url, tags, sort_order) VALUES
  ('t1', 'Saifuddin',   'Founder / Creative Director', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=75&fm=webp', ARRAY['Strategy','Brand','Vision'],  1),
  ('t2', 'Design Lead', 'Art Direction & Brand',        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=75&fm=webp', ARRAY['Design','Identity','Motion'], 2),
  ('t3', 'Tech Director','Immersive Web & Dev',         'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=75&fm=webp', ARRAY['Web','GSAP','React'],         3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO process_steps (id, number, title, description, sort_order) VALUES
  ('ps1','01','Discovery', 'We don''t start with solutions. We start with questions. We deconstruct your brand to its atomic level, understanding the chaos before we implement the order.', 1),
  ('ps2','02','Strategy',  'Chaos needs a container. We build the strategic framework that will hold the vision. Positioning, voice, and visual direction are defined here.',                   2),
  ('ps3','03','Execution', 'Where the rubber meets the road. We deploy high-fidelity design, motion, and code. No templates. No shortcuts. Just pure craftsmanship.',                         3),
  ('ps4','04','Launch',    'The reveal. We manage the deployment, ensure performance across the globe, and hand over the keys to your new digital empire.',                                    4)
ON CONFLICT (id) DO NOTHING;
