/**
 * src/components/layout/CustomCursor.tsx
 *
 * SVG logo-matched cursor. Only initialises on pointer-fine devices.
 * GSAP quickTo handles smooth 60fps tracking with minimal overhead.
 */
import { useEffect, useRef } from "react";
import { gsap } from "../../lib/gsap";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring   = ringRef.current;
    if (!cursor || !ring) return;

    // Only activate on pointer-capable devices (mouse / trackpad)
    if (!window.matchMedia("(pointer: fine)").matches) return;

    gsap.set(cursor, { xPercent: 0, yPercent: 0 });
    gsap.set(ring,   { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });

    // quickTo: compiled once per axis — just update end value each frame
    const xTo     = gsap.quickTo(cursor, "x", { duration: 0.06, ease: "power2.out" });
    const yTo     = gsap.quickTo(cursor, "y", { duration: 0.06, ease: "power2.out" });
    const xToRing = gsap.quickTo(ring,   "x", { duration: 0.18, ease: "power2.out" });
    const yToRing = gsap.quickTo(ring,   "y", { duration: 0.18, ease: "power2.out" });

    const onMouseMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      xToRing(e.clientX);
      yToRing(e.clientY);
    };

    const onHoverStart = (target?: Element) => {
      const text = target?.getAttribute("data-cursor-text") || "";
      if (ring) ring.innerText = text;

      if (text) {
        gsap.to(cursor, { scale: 0, opacity: 0, duration: 0.25, ease: "power2.out" });
        gsap.to(ring, {
          scale: 1, opacity: 1, 
          width: 72, height: 32, borderRadius: 16,
          background: "#d4e157", borderColor: "transparent",
          duration: 0.3, ease: "back.out(1.5)" 
        });
      } else {
        gsap.to(cursor, { scale: 1.25, opacity: 1, duration: 0.25, ease: "power2.out" });
        gsap.to(ring,   { 
          scale: 1, opacity: 1, 
          background: "transparent", borderColor: "rgba(46, 196, 182, 0.5)", 
          width: 48, height: 48, borderRadius: "50%", 
          duration: 0.25, ease: "power2.out" 
        });
      }
    };

    const onHoverEnd = () => {
      if (ring) ring.innerText = "";
      gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.25, ease: "power2.out" });
      gsap.to(ring,   { 
        scale: 0, opacity: 0, 
        width: 48, height: 48, borderRadius: "50%", 
        background: "transparent", borderColor: "rgba(46, 196, 182, 0.5)", 
        duration: 0.2, ease: "power2.in"  
      });
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    let hoveredEl: Element | null = null;

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as Element;
      const interactiveEl = target.closest("a, button, .cursor-pointer");
      
      if (interactiveEl && interactiveEl !== hoveredEl) {
        hoveredEl = interactiveEl;
        onHoverStart(interactiveEl);
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const related = e.relatedTarget as Element | null;
      
      // If we had a hovered element, and the cursor just moved to an element
      // OUTSIDE of it (or left the window completely), trigger hover end.
      if (hoveredEl && !hoveredEl.contains(related)) {
        hoveredEl = null;
        onHoverEnd();
      }
    };

    document.addEventListener("mouseover", onMouseOver, { passive: true });
    document.addEventListener("mouseout", onMouseOut, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="custom-cursor-arrow" aria-hidden="true">
        <svg
          version="1.2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 158 162"
          width="38"
          height="40"
          style={{ transform: "scaleX(-1)" }}
        >
          <defs>
            <radialGradient
              id="g1"
              cx="0" cy="0" r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(-109.367,135.248,-135.248,-109.367,156.614,5.704)"
            >
              <stop offset=".004" stopColor="#e9e22e" />
              <stop offset="1"    stopColor="#3acae4" />
            </radialGradient>
          </defs>
          <path
            fill="url(#g1)"
            d="m154.89 16.47l-47.69 138.69c-2.73 7.94-14.09 7.58-16.3-0.52l-17.17-62.74c-0.87-3.17-3.47-5.56-6.7-6.15l-57.76-10.55c-8.46-1.55-9.58-13.22-1.57-16.35l136.01-53.11c6.77-2.64 13.54 3.85 11.18 10.73z"
          />
        </svg>
      </div>

      {/* Hover ring — trails cursor, visible on interactive elements */}
      <div ref={ringRef} className="custom-cursor-ring" aria-hidden="true" />
    </>
  );
}
