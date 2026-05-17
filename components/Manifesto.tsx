"use client";

/**
 * Manifesto.tsx — Production-grade, drop-in replacement.
 *
 * SCROLL TUNING:
 *   Desktop: 60vh per statement (was 100vh) — feels purposeful, not sluggish.
 *   Mobile:  40vh per statement — thumb scrolls cover less distance, so we
 *            compress the pin range further to keep it snappy.
 *
 * PERFORMANCE: blur() only fires once per transition (index-gated), not per tick.
 */

import React, { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../lib/gsap";

const statements = [
  "Creative Freedom.",
  "United Crew.",
  "We reject the ordinary.",
  "Bold is our baseline.",
  "Your vision. Our crew.",
];

export default function Manifesto() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const activeIndexRef = useRef<number>(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial state — GSAP is single source of truth for transforms
      gsap.set(textRefs.current, { opacity: 0, scale: 0.9, filter: "blur(12px)" });
      gsap.set(textRefs.current[0], { opacity: 1, scale: 1, filter: "blur(0px)" });

      // Scroll budget per statement + 1.5 extra vh of hold on the final statement
      // so the pin doesn't release the instant "Your vision. Our crew." appears.
      const isMobile = window.innerWidth < 768;
      const vhPerStatement = isMobile ? 40 : 60;
      // (statements.length) steps between statements + 1.5 dwell on the last one
      const totalScrollPx =
        (statements.length + 1.5) * (window.innerHeight * vhPerStatement / 100);

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: `+=${totalScrollPx}`,
        pin: true,
        scrub: 0.3,          // tighter scrub = less lag on fast scrolls
        onUpdate(self) {
          const index = Math.min(
            Math.floor(self.progress * (statements.length - 1)),
            statements.length - 1
          );

          // Only fire GSAP tweens when the active statement actually changes
          if (index === activeIndexRef.current) return;
          activeIndexRef.current = index;

          textRefs.current.forEach((el, i) => {
            if (!el) return;
            if (i === index) {
              gsap.to(el, {
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                duration: 0.55,
                ease: "power2.out",
                overwrite: "auto",
              });
            } else {
              gsap.to(el, {
                opacity: 0,
                scale: 0.9,
                filter: "blur(12px)",
                duration: 0.4,
                ease: "power2.in",
                overwrite: "auto",
              });
            }
          });
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="h-screen bg-[var(--bg-color)] text-[var(--text-color)] overflow-hidden relative flex items-center justify-center"
    >
      {/* Background — zero CSS filter, zero backdrop-blur, one paint call */}
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">

        {/* Color atmosphere — single background property, zero compositor layers */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 75% 65% at 22% 40%,  rgba(46,196,182,0.38)  0%, transparent 68%),
              radial-gradient(ellipse 70% 60% at 78% 60%,  rgba(212,225,87,0.32)  0%, transparent 68%),
              radial-gradient(ellipse 55% 50% at 50% 50%,  rgba(126,200,138,0.16) 0%, transparent 65%)
            `,
          }}
        />

        {/* Dark veil */}
        <div className="absolute inset-0 pointer-events-none bg-black/52" />

        {/* Glass sheen — pure gradient, zero backdrop-filter */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(
              160deg,
              rgba(46,196,182,0.06)  0%,
              rgba(255,255,255,0.02) 35%,
              rgba(212,225,87,0.05)  100%
            )`,
          }}
        />

        {/* Hairline color borders */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
          style={{ background: "linear-gradient(90deg, rgba(46,196,182,0.22), transparent 50%, rgba(212,225,87,0.18))" }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent 20%, rgba(212,225,87,0.12), transparent 80%)" }}
        />

        {/* Section fades */}
        <div
          className="absolute top-0 left-0 w-full h-[20vh] pointer-events-none z-[5]"
          style={{ background: "linear-gradient(to bottom, var(--bg-color) 0%, transparent 100%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-full h-[20vh] pointer-events-none z-[5]"
          style={{ background: "linear-gradient(to top, var(--bg-color) 0%, transparent 100%)" }}
        />
      </div>

      {/* Statements — stacked via absolute centering */}
      <div className="relative z-10 w-full text-center">
        {statements.map((text, i) => (
          <h2
            key={i}
            ref={(el) => { textRefs.current[i] = el; }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-6 text-[8vw] sm:text-[6vw] md:text-[5vw] font-heading font-bold uppercase leading-tight"
            style={
              i % 2 === 0
                ? { color: "#f4f4f4" }
                : { WebkitTextStroke: "1.5px #2ec4b6", color: "transparent" }
            }
          >
            {text}
          </h2>
        ))}
      </div>

      {/* Label */}
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 text-xs font-mono tracking-[0.2em] opacity-40 whitespace-nowrap"
        style={{ color: "#d4e157" }}
      >
        ( SCROLL DOWN )
      </div>
    </section>
  );
}