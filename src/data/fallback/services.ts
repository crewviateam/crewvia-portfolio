/**
 * src/data/fallback/services.ts
 *
 * Static fallback — used when Supabase is unreachable at build time.
 */
import type { Service } from "../../types";

export const servicesFallback: Service[] = [
  {
    id:          "s1",
    number:      "01",
    title:       "Brand Identity Design",
    description: "Brands that earn a second look, and a screenshot. From naming to launch assets, we build identity systems that scale with you, not ones you outgrow in 18 months.",
    items:       ["Brand Audit", "Naming", "Visual Identity", "Brand Guidelines", "Illustration", "Motion Design", "App Store Assets", "Marketing Material", "Pitch Deck"],
    image:       "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&q=75&fm=webp",
    category:    "Design",
  },
  {
    id:          "s2",
    number:      "02",
    title:       "Website Design",
    description: "Marketing sites that convert, not just decorate. We design for the founder who needs the homepage to do the work of three salespeople.",
    items:       ["Strategy & Positioning", "Information Architecture", "UI/UX Design", "Copywriting", "Webflow & Framer Build", "SEO Foundations", "Analytics Setup", "CRO Audit"],
    image:       "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=75&fm=webp",
    category:    "Web",
  },
  {
    id:          "s3",
    number:      "03",
    title:       "Development",
    description: "Full-stack and no-code, built by engineers who design-think. We pick the right stack for your business stage — not the one we're trying to sell you.",
    items:       ["Full-Stack Web Apps", "Mobile Apps", "No-Code Builds", "API Integrations", "Performance & SEO", "QA", "Maintenance"],
    image:       "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=75&fm=webp",
    category:    "Engineering",
  }
];
