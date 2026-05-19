/**
 * src/lib/fetchCmsData.ts
 *
 * Node.js module — runs in the Vite build process (not the browser).
 * Called exclusively by vite-plugin-cms.ts at buildStart.
 *
 * Responsibilities:
 *  1. Connect to Supabase with the anon key (read-only, public data)
 *  2. Fetch all content tables and site_content key-value store
 *  3. Map DB column names → TypeScript interface field names (e.g. image_url → image)
 *  4. Write typed JSON files to src/data/generated/
 *  5. On ANY failure, write the static fallback data instead
 *
 * The generated/ directory is git-ignored. Vite always runs this before
 * transforming source files, so the generated JSONs are always present
 * by the time data/*.ts files are processed.
 */

import fs   from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// ─── Static fallback data (imported at module load — works in all Node contexts) ─
import { projectsFallback }     from "../data/fallback/projects";
import { servicesFallback }     from "../data/fallback/services";
import { teamFallback }         from "../data/fallback/team";
import { processStepsFallback } from "../data/fallback/process";
import { siteContentFallback }  from "../data/fallback/siteContent";

// Absolute path to the generated directory
const GENERATED_DIR = path.resolve(process.cwd(), "src/data/generated");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ensureDir(): void {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
}

function writeJson(filename: string, data: unknown): void {
  fs.writeFileSync(
    path.join(GENERATED_DIR, filename),
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

// ─── Supabase Row → Interface Mappers ─────────────────────────────────────────
// DB uses `image_url`; TypeScript interfaces use `image`. All other fields match.

type ProjectRow     = Database["public"]["Tables"]["projects"]["Row"];
type ServiceRow     = Database["public"]["Tables"]["services"]["Row"];
type TeamMemberRow  = Database["public"]["Tables"]["team_members"]["Row"];
type ProcessStepRow = Database["public"]["Tables"]["process_steps"]["Row"];
type SiteContentRow = Database["public"]["Tables"]["site_content"]["Row"];

function mapProject(row: ProjectRow) {
  return {
    id:       row.id,
    title:    row.title,
    category: row.category,
    year:     row.year,
    tags:     row.tags,
    image:    row.image_url,   // DB: image_url  → Interface: image
    color:    row.color,
  };
}

function mapService(row: ServiceRow) {
  return {
    id:          row.id,
    number:      row.number,
    title:       row.title,
    description: row.description,
    items:       row.items,
    image:       row.image_url, // DB: image_url  → Interface: image
    category:    row.category,
  };
}

function mapTeamMember(row: TeamMemberRow) {
  return {
    id:    row.id,
    name:  row.name,
    role:  row.role,
    image: row.image_url,       // DB: image_url  → Interface: image
    tags:  row.tags,
  };
}

function mapProcessStep(row: ProcessStepRow) {
  return {
    id:          row.id,
    number:      row.number,
    title:       row.title,
    description: row.description,
  };
}

function mapSiteContent(rows: SiteContentRow[]): Record<string, string> {
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

// ─── Main Fetch Function ───────────────────────────────────────────────────────

export async function fetchAndWriteCmsData(
  supabaseUrl: string,
  supabaseKey: string
): Promise<void> {
  ensureDir();

  const client = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  // Run all fetches in parallel — each table is independent
  const [projectsRes, servicesRes, teamRes, processRes, contentRes] =
    await Promise.all([
      client
        .from("projects")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true }),

      client
        .from("services")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true }),

      client
        .from("team_members")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true }),

      client
        .from("process_steps")
        .select("*")
        .order("sort_order", { ascending: true }),

      client
        .from("site_content")
        .select("key, value"),
    ]);

  // Throw on any error — caller handles the fallback
  if (projectsRes.error) throw new Error(`projects: ${projectsRes.error.message}`);
  if (servicesRes.error) throw new Error(`services: ${servicesRes.error.message}`);
  if (teamRes.error)     throw new Error(`team_members: ${teamRes.error.message}`);
  if (processRes.error)  throw new Error(`process_steps: ${processRes.error.message}`);
  if (contentRes.error)  throw new Error(`site_content: ${contentRes.error.message}`);

  // Validate we actually got data (empty DB = fall back)
  if (!projectsRes.data?.length) throw new Error("projects table is empty");
  if (!servicesRes.data?.length) throw new Error("services table is empty");
  if (!teamRes.data?.length)     throw new Error("team_members table is empty");
  if (!processRes.data?.length)  throw new Error("process_steps table is empty");

  // Write mapped JSON files
  writeJson("projects.json",    projectsRes.data.map(mapProject));
  writeJson("services.json",    servicesRes.data.map(mapService));
  writeJson("team.json",        teamRes.data.map(mapTeamMember));
  writeJson("process.json",     processRes.data.map(mapProcessStep));
  writeJson("siteContent.json", mapSiteContent(contentRes.data ?? []));
}

// ─── Fallback Writer ───────────────────────────────────────────────────────────
// Uses the statically imported fallback arrays (loaded at module init time).
// Writes them to generated/ in the same JSON format so data/*.ts files
// always point to generated/ with no conditional logic needed.

export function writeFallbackDataFiles(): void {
  ensureDir();
  writeJson("projects.json",    projectsFallback);
  writeJson("services.json",    servicesFallback);
  writeJson("team.json",        teamFallback);
  writeJson("process.json",     processStepsFallback);
  writeJson("siteContent.json", siteContentFallback);
}
