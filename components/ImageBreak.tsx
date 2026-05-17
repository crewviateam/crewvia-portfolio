"use client";

/**
 * ImageBreak.tsx — drop-in replacement.
 *
 * FIXES vs original:
 * ❌ scale: 1.1 animated on scrub          → ✅ removed. Combining scale+yPercent
 *    scrollTrigger scrub                       on the same element on every scroll
 *                                              tick forces a compositor layer
 *                                              recalculation each frame. yPercent
 *                                              alone gives the parallax feel.
 * ❌ mix-blend-mode: overlay on the veil   → ✅ removed. blend modes promote the
 *                                              element to its own compositor layer
 *                                              permanently. Replaced with a plain
 *                                              bg-black/20 — visually identical.
 */

import React, { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ImageBreak() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef       = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(imgRef.current, {
        yPercent: 20,       // translate only — no scale
        force3D: true,      // keeps it on the GPU compositor layer
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-[60vh] md:h-[80vh] overflow-hidden relative">
      <img
        ref={imgRef}
        src="https://images.unsplash.com/photo-1618172193763-c511deb635ca?auto=format&fit=crop&w=1920&q=75&fm=webp"
        alt="Abstract Texture"
        width={1920}
        height={1080}
        loading="lazy"
        decoding="async"
        className="w-full h-[120%] object-cover -translate-y-[10%]"
      />
      {/* Plain overlay — no mix-blend-mode, no compositor layer promotion */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
    </div>
  );
}