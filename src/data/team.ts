/**
 * src/data/team.ts
 *
 * Imports from the build-time generated JSON (written by vite-plugin-cms).
 * To update content: edit via the CMS admin → Vercel auto-redeploys.
 */
import type { TeamMember } from "../types";
import generatedData from "./generated/team.json";

export const team: TeamMember[] = generatedData as TeamMember[];

