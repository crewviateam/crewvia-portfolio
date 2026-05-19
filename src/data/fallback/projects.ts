/**
 * src/data/fallback/projects.ts
 *
 * Static fallback — used when Supabase is unreachable at build time.
 * This is the ground truth for the portfolio until CMS is seeded.
 */
import type { Project } from "../../types";

export const projectsFallback: Project[] = [
  {
    id:       "p1",
    title:    "Aeon",
    category: "Immersive",
    year:     "2024",
    tags:     ["Motion", "3D", "Web"],
    image:    "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=800&q=75&fm=webp",
    color:    "#2ec4b6",
  },
  {
    id:       "p2",
    title:    "Mono",
    category: "Identity",
    year:     "2023",
    tags:     ["Brand", "Logo", "Print"],
    image:    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=75&fm=webp",
    color:    "#d4e157",
  },
  {
    id:       "p3",
    title:    "Nebula",
    category: "Web",
    year:     "2024",
    tags:     ["React", "GSAP", "Three.js"],
    image:    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=75&fm=webp",
    color:    "#2ec4b6",
  },
  {
    id:       "p4",
    title:    "Kinetic",
    category: "Motion",
    year:     "2023",
    tags:     ["After Effects", "Cinema 4D"],
    image:    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=75&fm=webp",
    color:    "#d4e157",
  },
  {
    id:       "p5",
    title:    "Dust",
    category: "CGI",
    year:     "2022",
    tags:     ["Blender", "Houdini"],
    image:    "https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&w=800&q=75&fm=webp",
    color:    "#2ec4b6",
  },
  {
    id:       "p6",
    title:    "Void",
    category: "Experiential",
    year:     "2023",
    tags:     ["Projection", "AR", "Installation"],
    image:    "https://images.unsplash.com/photo-1515462277126-2dd0c162007a?auto=format&fit=crop&w=800&q=75&fm=webp",
    color:    "#d4e157",
  },
];
