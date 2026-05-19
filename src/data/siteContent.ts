/**
 * src/data/siteContent.ts
 *
 * Exports all editable site text as a typed key-value map.
 * Imports from build-time generated JSON (written by vite-plugin-cms).
 *
 * Usage in components:
 *   import { siteContent, getContent } from '../../data/siteContent';
 *   const tagline = getContent('hero_tagline');
 *
 * For JSON-encoded fields (manifesto_statements, marquee_items), use:
 *   const statements = JSON.parse(getContent('manifesto_statements')) as string[];
 */
import type { SiteContentMap } from "../types";
import generatedData from "./generated/siteContent.json";

export const siteContent: SiteContentMap = generatedData as SiteContentMap;

/**
 * Type-safe getter with an optional fallback value.
 * Returns the content value or the fallback (defaults to empty string).
 */
export function getContent(key: keyof SiteContentMap, fallback = ""): string {
  return siteContent[key] ?? fallback;
}

/**
 * Parse a JSON-encoded content field into a typed array.
 * Used for manifesto_statements and marquee_items.
 */
export function getContentArray<T = string>(
  key: keyof SiteContentMap,
  fallback: T[] = []
): T[] {
  try {
    const raw = siteContent[key];
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    console.warn(`[siteContent] Failed to parse JSON for key: ${String(key)}`);
    return fallback;
  }
}
