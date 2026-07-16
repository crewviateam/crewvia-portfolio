/**
 * src/data/projects.ts
 *
 * Imports from the build-time generated JSON (written by vite-plugin-cms).
 * The generated file is ALWAYS present when this module is processed:
 *  - Supabase reachable  → fresh data from the DB
 *  - Supabase unreachable → fallback data (from src/data/fallback/projects.ts)
 *
 * To update content: edit via the CMS admin → save → Vercel auto-redeploys.
 */
import type { Project } from "../types";
import generatedData from "./generated/projects.json";
import { projectsFallback } from "./fallback/projects";

// We currently only want to show our 3 star-grade case studies and nothing else.
// (Ignoring cmsProjects for now until the backend is fully updated with new non-dummy data)
export const projects: Project[] = [...projectsFallback];

