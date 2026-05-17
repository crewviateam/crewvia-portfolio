"use client";

/**
 * PageLoader.tsx — Logo intro animation loader.
 *
 * Animation sequence:
 *  1. Screen starts black
 *  2. Brackets [ { fade in and hold in place (they are always in position)
 *  3. Arrow flies in from top-left corner with a "flying" motion
 *     (starts small, rotated, fast — decelerates into exact logo position)
 *  4. Short hold on complete logo
 *  5. Entire loader fades out / slides up, revealing the site
 *
 * Usage in App.tsx:
 *   import PageLoader from "./components/PageLoader";
 *
 *   // In your App component:
 *   const [loading, setLoading] = useState(true);
 *   ...
 *   return (
 *     <>
 *       {loading && <PageLoader onComplete={() => setLoading(false)} />}
 *       <div style={{ visibility: loading ? "hidden" : "visible" }}>
 *         ... rest of site ...
 *       </div>
 *     </>
 *   );
 */

import React, { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";

interface PageLoaderProps {
  onComplete?: () => void;
}

export default function PageLoader({ onComplete }: PageLoaderProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const arrowRef   = useRef<SVGGElement>(null);
  const bracketRef = useRef<SVGGElement>(null);
  const loaderRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          // After exit animation, call onComplete to unmount
          onComplete?.();
        },
      });

      // ── 1. Initial state ────────────────────────────────────────────────
      // Brackets: visible but faded, already in position
      gsap.set(bracketRef.current, { opacity: 0 });
      // Arrow: starts off top-left, small, rotated — like a paper plane launching
      gsap.set(arrowRef.current, {
        opacity: 0,
        x: -220,
        y: -180,
        scale: 0.3,
        rotation: -35,
        transformOrigin: "50% 50%",
      });

      // ── 2. Brackets fade in ─────────────────────────────────────────────
      tl.to(bracketRef.current, {
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
      });

      // ── 3. Arrow flies in ───────────────────────────────────────────────
      // Phase A: fast travel across screen (like a thrown dart)
      tl.to(
        arrowRef.current,
        {
          opacity: 1,
          x: 18,       // overshoot slightly past logo center
          y: -12,
          scale: 0.85,
          rotation: 8,
          duration: 0.55,
          ease: "power3.in",
        },
        "-=0.1"
      );

      // Phase B: decelerate + settle into exact position (the "landing")
      tl.to(arrowRef.current, {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        duration: 0.65,
        ease: "elastic.out(1, 0.6)",
      });

      // ── 4. Hold on complete logo ────────────────────────────────────────
      tl.to({}, { duration: 0.9 });

      // ── 5. Exit: loader slides up and out ──────────────────────────────
      tl.to(loaderRef.current, {
        yPercent: -100,
        duration: 0.85,
        ease: "power4.inOut",
      });

    }, wrapperRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        pointerEvents: "all",
      }}
    >
      {/* The sliding panel */}
      <div
        ref={loaderRef}
        style={{
          position: "absolute",
          inset: 0,
          background: "#050505",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "32px",
        }}
      >
        {/* Logo SVG — exact viewBox from source file: 0 0 158 162 */}
        <svg
          width="120"
          height="123"
          viewBox="0 0 158 162"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: "visible" }}
        >
          <defs>
            {/* Exact radial gradient from the SVG source */}
            <radialGradient
              id="loader-arrow-grad"
              cx="0" cy="0" r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(-109.367,135.248,-135.248,-109.367,156.614,5.704)"
            >
              <stop offset=".004" stopColor="#e9e22e" />
              <stop offset="1"    stopColor="#3acae4" />
            </radialGradient>

            {/* Bracket colour */}
            <style>{`.bracket-fill { fill: #1e3fa8; }`}</style>
          </defs>

          {/*
           * ── BRACKETS ──────────────────────────────────────────────────
           * Reconstructed from the logo image.
           * Left bracket  = [ shape on left side
           * Right bracket = } shape on right side
           * Both are purely decorative — exact positions eyeballed from logo.
           */}
          <g ref={bracketRef}>
            {/* Left bracket — [ */}
            <path
              className="bracket-fill"
              d="
                M 28 10
                L 14 10
                Q 8 10 8 16
                L 8 42
                L 16 42
                L 16 18
                L 28 18
                Z

                M 8 120
                L 8 146
                Q 8 152 14 152
                L 28 152
                L 28 144
                L 16 144
                L 16 120
                Z
              "
            />

            {/* Right bracket — } */}
            <path
              className="bracket-fill"
              d="
                M 118 10
                L 132 10
                Q 150 10 150 28
                L 150 56
                Q 150 68 140 74
                Q 150 80 150 92
                L 150 128
                Q 150 148 132 150
                L 118 150
                L 118 142
                L 130 142
                Q 142 142 142 130
                L 142 94
                Q 142 82 132 80
                L 126 80
                L 126 72
                L 132 72
                Q 142 72 142 60
                L 142 30
                Q 142 18 130 18
                L 118 18
                Z
              "
            />
          </g>

          {/*
           * ── ARROW ─────────────────────────────────────────────────────
           * Exact path from the SVG source file.
           * GSAP animates this group — starts off-screen top-left,
           * flies in and settles at (0,0) = its natural logo position.
           */}
          <g ref={arrowRef}>
            <path
              d="m154.89 16.47l-47.69 138.69c-2.73 7.94-14.09 7.58-16.3-0.52l-17.17-62.74c-0.87-3.17-3.47-5.56-6.7-6.15l-57.76-10.55c-8.46-1.55-9.58-13.22-1.57-16.35l136.01-53.11c6.77-2.64 13.54 3.85 11.18 10.73z"
              fill="url(#loader-arrow-grad)"
            />
          </g>
        </svg>

        {/* Brand name beneath logo */}
        <div
          style={{
            color: "rgba(255,255,255,0.18)",
            fontSize: "11px",
            letterSpacing: "0.38em",
            fontFamily: "monospace",
            textTransform: "uppercase",
            marginTop: "8px",
          }}
        >
          CREWVIA
        </div>
      </div>
    </div>
  );
}