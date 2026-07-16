/**
 * src/types/index.ts
 * Shared TypeScript interfaces for all portfolio data.
 * Components import types from here — never declare inline interfaces.
 */

// ─── Content Data Types ───────────────────────────────────────────────────────

export interface Project {
  id:       string;
  title:    string;
  category: string;
  year:     string;
  tags:     string[];
  image:    string;
  color:    string;
  description?: string;
  
  // Dynamic Case Study Storytelling Fields
  problemStatement?: string;
  problemParagraphs?: string[];
  frictionPoints?: string[];
  solutionStatement?: string;
  solutionParagraphs?: string[];
}

export interface Service {
  id:          string;
  number:      string;
  title:       string;
  description: string;
  items:       string[];
  image:       string;
  category:    string;
}

export interface TeamMember {
  id:    string;
  name:  string;
  role:  string;
  image: string;
  tags:  string[];
}

export interface ProcessStep {
  id:          string;
  number:      string;
  title:       string;
  description: string;
}

export interface NavLink {
  href:  string;
  label: string;
}

// ─── Site Content (CMS Key-Value) ─────────────────────────────────────────────
// All editable free-text content keyed by a stable identifier.
// Keys must match exactly the `key` values in the site_content Supabase table.
export interface SiteContentMap {
  hero_tagline:         string;
  hero_available_text:  string;
  hero_location_text:   string;
  intro_body:           string;
  /** JSON string — parse with JSON.parse → string[] */
  manifesto_statements: string;
  /** JSON string — parse with JSON.parse → Array<{ text: string; outline: boolean }> */
  marquee_items:        string;
  footer_cta_heading:   string;
  footer_description:   string;
  footer_copyright:     string;
  services_tagline:     string;
  process_subtitle:     string;
  [key: string]: string; // allow unknown keys without TS error
}

// ─── Analytics Types ──────────────────────────────────────────────────────────

export type AnalyticsEventType =
  | "page_view"
  | "section_view"
  | "scroll_depth"
  | "time_on_page"
  | "link_click"
  | "cta_click"
  | "project_hover";

export type CtaName = "explore_work" | "start_project" | "lets_build";

export type SectionName =
  | "hero"
  | "intro"
  | "work"
  | "process"
  | "manifesto"
  | "team"
  | "services"
  | "marquee"
  | "contact";

export interface AnalyticsEventPayload {
  page_view:    { path: string };
  section_view: { section: SectionName };
  scroll_depth: { depth: 25 | 50 | 75 | 100 };
  time_on_page: { seconds: number };
  link_click:   { label: string; href: string };
  cta_click:    { cta: CtaName };
  project_hover:{ project_id: string; project_title: string };
}

export interface AnalyticsEvent<T extends AnalyticsEventType = AnalyticsEventType> {
  session_id:  string;
  event_type:  T;
  event_data:  T extends keyof AnalyticsEventPayload ? AnalyticsEventPayload[T] : Record<string, unknown>;
}

