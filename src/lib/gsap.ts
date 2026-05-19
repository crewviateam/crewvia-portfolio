/**
 * src/lib/gsap.ts
 *
 * Centralised GSAP + plugin registration.
 * Import from here everywhere — never call gsap.registerPlugin() in components.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register once, globally — avoids duplicate registration warnings
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
