/**
 * src/data/fallback/siteContent.ts
 *
 * Static fallback for all site_content key-value pairs.
 * Used when Supabase is unreachable at build time.
 *
 * These values mirror exactly what is seeded in database/schema.sql.
 */
import type { SiteContentMap } from "../../types";

export const siteContentFallback: SiteContentMap = {
  hero_tagline:         '"Creative Freedom, United Crew — we craft bold brands, immersive experiences, and world-class campaigns."',
  hero_available_text:  "Taking on new projects",
  hero_location_text:   "Global · Remote",
  intro_body:           "In the age of templates, creative freedom is currency. We strip away the non-essential to reveal the raw, beating heart of your brand — and unite a crew to bring it to life.",
  manifesto_statements: '["Creative Freedom.","United Crew.","We reject the ordinary.","Bold is our baseline.","Your vision. Our crew."]',
  marquee_items:        '[{"text":"Branding","outline":true},{"text":"Direction","outline":false},{"text":"Film","outline":true},{"text":"Web","outline":false},{"text":"Marketing","outline":true},{"text":"Identity","outline":false}]',
  footer_cta_heading:   "Have a project in mind?",
  footer_description:   "Creative Freedom, United Crew. A global creative studio specialising in brand identity, immersive web, film, and campaigns.",
  footer_copyright:     "© 2025 CREWVIA • Creative Freedom, United Crew",
  services_tagline:     "Comprehensive creative solutions for forward-thinking brands — from strategy to screen.",
  process_subtitle:     "Our methodology is a blend of rigorous strategy and unbridled creativity.",
};
