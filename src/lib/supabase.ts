/**
 * src/lib/supabase.ts
 *
 * Typed Supabase client for the portfolio frontend.
 * - Uses VITE_ env vars (safe to expose: anon key + project URL only)
 * - Provides a typed Database generic for full type-safety on queries
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  // Only throw during build — not at runtime if keys are missing
  if (import.meta.env.MODE !== "test") {
    console.warn(
      "[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. " +
      "Falling back to static data files."
    );
  }
}

export const supabase = createClient<Database>(
  supabaseUrl  ?? "",
  supabaseKey  ?? "",
  {
    auth: { persistSession: false },  // portfolio is public — no auth needed
  }
);
