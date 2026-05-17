import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugins once centrally to avoid redundant initializations and warnings
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Export the configured instances
export { gsap, ScrollTrigger };
