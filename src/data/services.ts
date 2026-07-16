/**
 * src/data/services.ts
 *
 * Imports from the build-time generated JSON (written by vite-plugin-cms).
 * To update content: edit via the CMS admin → Vercel auto-redeploys.
 */
import type { Service } from "../types";
import { servicesFallback } from "./fallback/services";

export const services: Service[] = servicesFallback;

