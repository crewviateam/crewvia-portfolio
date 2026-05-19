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
    title:       "Brand Identity",
    description: "Strategy-led identity systems that make your brand unmistakable.",
    items:       ["Logo Design", "Visual Language", "Brand Guidelines", "Positioning"],
    image:       "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&q=75&fm=webp",
    category:    "Strategy",
  },
  {
    id:          "s2",
    number:      "02",
    title:       "Art Direction",
    description: "Bold visual narratives that command attention across every medium.",
    items:       ["Photography Direction", "Set Design", "Retouching", "Campaign Visuals"],
    image:       "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=75&fm=webp",
    category:    "Design",
  },
  {
    id:          "s3",
    number:      "03",
    title:       "Film Production",
    description: "Cinematic content that moves audiences and drives culture.",
    items:       ["Brand Films", "Campaign Videos", "Documentary", "Motion Graphics"],
    image:       "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=75&fm=webp",
    category:    "Content",
  },
  {
    id:          "s4",
    number:      "04",
    title:       "Immersive Web",
    description: "Digital experiences that feel alive — not just functional.",
    items:       ["WebGL / Three.js", "GSAP Animations", "React / Next.js", "Performance Optimisation"],
    image:       "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=75&fm=webp",
    category:    "Development",
  },
  {
    id:          "s5",
    number:      "05",
    title:       "Campaigns",
    description: "Full-funnel creative campaigns that build brands and drive results.",
    items:       ["Strategy", "Creative Concept", "Media Planning", "Execution"],
    image:       "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=75&fm=webp",
    category:    "Marketing",
  },
];
