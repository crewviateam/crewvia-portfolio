/**
 * src/data/fallback/process.ts
 *
 * Static fallback — used when Supabase is unreachable at build time.
 */
import type { ProcessStep } from "../../types";

export const processStepsFallback: ProcessStep[] = [
  {
    id:          "ps1",
    number:      "01",
    title:       "Discovery",
    description: "We don't start with solutions. We start with questions. We deconstruct your brand to its atomic level, understanding the chaos before we implement the order.",
  },
  {
    id:          "ps2",
    number:      "02",
    title:       "Strategy",
    description: "Chaos needs a container. We build the strategic framework that will hold the vision. Positioning, voice, and visual direction are defined here.",
  },
  {
    id:          "ps3",
    number:      "03",
    title:       "Execution",
    description: "Where the rubber meets the road. We deploy high-fidelity design, motion, and code. No templates. No shortcuts. Just pure craftsmanship.",
  },
  {
    id:          "ps4",
    number:      "04",
    title:       "Launch",
    description: "The reveal. We manage the deployment, ensure performance across the globe, and hand over the keys to your new digital empire.",
  },
];
