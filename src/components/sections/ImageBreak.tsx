/**
 * src/components/sections/ImageBreak.tsx
 *
 * Parallax image break between sections.
 * yPercent only (no scale) to keep compositor layer cost minimal.
 * Removed duplicate gsap.registerPlugin (handled centrally in src/lib/gsap.ts).
 */
import React, { useEffect, useRef } from "react";
import { gsap } from "../../lib/gsap";

export default function ImageBreak() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef       = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(imgRef.current, {
        yPercent: 20,
        force3D: true,
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
        alt="Abstract creative texture"
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
