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

export const projects: Project[] = generatedData as Project[];

