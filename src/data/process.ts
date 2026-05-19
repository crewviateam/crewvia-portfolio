/**
 * src/data/process.ts
 *
 * Imports from the build-time generated JSON (written by vite-plugin-cms).
 * To update content: edit via the CMS admin → Vercel auto-redeploys.
 */
import type { ProcessStep } from "../types";
import generatedData from "./generated/process.json";

export const processSteps: ProcessStep[] = generatedData as ProcessStep[];

