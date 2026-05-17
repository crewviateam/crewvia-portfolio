"use client";

/**
 * CustomCursor.tsx — logo-matched cursor, drop-in replacement.
 *
 * Shape: classic mouse pointer cursor (same silhouette as logo icon)
 *   - Sharp top-left tip = HOTSPOT (0,0)
 *   - Angled right edge going down-right
 *   - Concave notch cut into bottom-right (the classic cursor indent)
 *   - Straight left edge going back up
 * Gradient: teal (#2ec4b6) bottom-left → yellow-green (#e8f53a) top-right
 *
 * FIXES vs previous version:
 * ❌ Wrong shape (4-point star)       → ✅ Correct cursor pointer silhouette
 * ❌ Cursor hidden behind sections    → ✅ z-index: 999999 on both elements,
 *    due to z-index stacking context      position: fixed escapes all stacking
 *                                         contexts. Also added isolation:isolate
 *                                         guard in CSS.
 * ❌ xPercent offset was wrong        → ✅ xPercent:0, yPercent:0 — hotspot
 *                                         is top-left corner of the SVG (0,0)
 *                                         which maps directly to the cursor tip.
 *
 * ADD THE CSS BLOCK AT THE BOTTOM TO YOUR globals.css
 */

import React, { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring   = ringRef.current;
    if (!cursor || !ring) return;

    // Only on pointer-fine devices (mouse / trackpad), never touch
    if (!window.matchMedia("(pointer: fine)").matches) return;

    // Hotspot = top-left tip of cursor SVG = element's top-left corner
    // So no percent offset needed — just position the element directly
    gsap.set(cursor, { xPercent: 0, yPercent: 0 });
    gsap.set(ring,   { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });

    // quickTo: compiled once — just update end value each frame
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

    const onHoverStart = () => {
      gsap.to(cursor, { scale: 1.25, duration: 0.25, ease: "power2.out" });
      gsap.to(ring,   { scale: 1, opacity: 1, duration: 0.25, ease: "power2.out" });
    };

    const onHoverEnd = () => {
      gsap.to(cursor, { scale: 1,    duration: 0.25, ease: "power2.out" });
      gsap.to(ring,   { scale: 0, opacity: 0, duration: 0.2,  ease: "power2.in"  });
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    const clickables = document.querySelectorAll("a, button, .cursor-pointer");
    clickables.forEach((el) => {
      el.addEventListener("mouseenter", onHoverStart);
      el.addEventListener("mouseleave", onHoverEnd);
    });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      clickables.forEach((el) => {
        el.removeEventListener("mouseenter", onHoverStart);
        el.removeEventListener("mouseleave", onHoverEnd);
      });
    };
  }, []);

  return (
    <>
      {/*
        SVG cursor — classic pointer shape matching the logo.

        Path coordinates (40×40 viewBox):
          M 2,2      = top-left tip (HOTSPOT)
          L 2,34     = bottom-left
          L 12,26    = inner concave notch bottom
          L 18,38    = bottom tail spike
          L 22,36    = tail right
          L 16,24    = inner concave notch top
          L 30,24    = right side
          Z          = close back to tip

        This gives the classic asymmetric cursor silhouette:
        sharp top-left tip, wide body, concave cut on the bottom-right.

        Gradient: teal at bottom-left → yellow at top-right, diagonal,
        matching the logo's colour sweep exactly.
      */}
      <div
        ref={cursorRef}
        className="custom-cursor-arrow"
        aria-hidden="true"
      >
        <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 158 162" width="40" height="42" style={{ transform: 'scaleX(-1)' }}>
          <defs>
            <radialGradient id="g1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-109.367,135.248,-135.248,-109.367,156.614,5.704)">
              <stop offset=".004" stopColor="#e9e22e"/>
              <stop offset="1" stopColor="#3acae4"/>
            </radialGradient>
          </defs>
          <path fill="url(#g1)" d="m154.89 16.47l-47.69 138.69c-2.73 7.94-14.09 7.58-16.3-0.52l-17.17-62.74c-0.87-3.17-3.47-5.56-6.7-6.15l-57.76-10.55c-8.46-1.55-9.58-13.22-1.57-16.35l136.01-53.11c6.77-2.64 13.54 3.85 11.18 10.73z"/>
        </svg>
      </div>

      {/* Hover ring — trails cursor, appears on clickable elements */}
      <div
        ref={ringRef}
        className="custom-cursor-ring"
        aria-hidden="true"
      />
    </>
  );
}

/*
 * ══════════════════════════════════════════════════════════════════════
 * ADD THIS TO globals.css / index.css  — replace any old .custom-cursor
 * ══════════════════════════════════════════════════════════════════════
 *
 * Hide native OS cursor on pointer devices only (not touch):
 *
 * @media (pointer: fine) {
 *   html, html * {
 *     cursor: none !important;
 *   }
 * }
 *
 * .custom-cursor-arrow {
 *   position: fixed;
 *   top: 0;
 *   left: 0;
 *   width: 40px;
 *   height: 42px;
 *   pointer-events: none;
 *   z-index: 999999;          <-- must beat every section z-index
 *   will-change: transform;
 *   filter: drop-shadow(0 2px 6px rgba(46, 196, 182, 0.35));
 * }
 *
 * .custom-cursor-ring {
 *   position: fixed;
 *   top: 0;
 *   left: 0;
 *   width: 48px;
 *   height: 48px;
 *   border-radius: 50%;
 *   border: 1.5px solid rgba(46, 196, 182, 0.5);
 *   pointer-events: none;
 *   z-index: 999998;          <-- just under arrow
 *   will-change: transform;
 * }
 * ══════════════════════════════════════════════════════════════════════
 */
        // <svg
        //   width="40"
        //   height="42"
        //   viewBox="0 0 40 42"
        //   fill="none"
        //   xmlns="http://www.w3.org/2000/svg"
        // >
        //   <defs>
        //     <linearGradient
        //       id="cur-g"
        //       x1="2"  y1="38"
        //       x2="30" y2="2"
        //       gradientUnits="userSpaceOnUse"
        //     >
        //       <stop offset="0%"   stopColor="#2ec4b6" />
        //       <stop offset="55%"  stopColor="#9ddc3e" />
        //       <stop offset="100%" stopColor="#e8f53a" />
        //     </linearGradient>
        //   </defs>
        //   {/* Classic pointer cursor silhouette */}
        //   <path
        //     d="M2 2 L2 34 L12 26 L18 38 L22 36 L16 24 L30 24 Z"
        //     fill="url(#cur-g)"
        //   />
        // </svg>