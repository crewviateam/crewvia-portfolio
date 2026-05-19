/**
 * src/data/fallback/team.ts
 *
 * Static fallback — used when Supabase is unreachable at build time.
 */
import type { TeamMember } from "../../types";

export const teamFallback: TeamMember[] = [
  {
    id:    "t1",
    name:  "Saifuddin",
    role:  "Founder / Creative Director",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=75&fm=webp",
    tags:  ["Strategy", "Brand", "Vision"],
  },
  {
    id:    "t2",
    name:  "Design Lead",
    role:  "Art Direction & Brand",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=75&fm=webp",
    tags:  ["Design", "Identity", "Motion"],
  },
  {
    id:    "t3",
    name:  "Tech Director",
    role:  "Immersive Web & Dev",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=75&fm=webp",
    tags:  ["Web", "GSAP", "React"],
  },
];
