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
      <div 
        ref={imgRef}
        className="w-full h-[120%] -translate-y-[10%]"
        style={{
          background: 'linear-gradient(135deg, #050505 0%, #112826 50%, #050505 100%)',
        }}
      >
        {/* Grain overlay for texture */}
        <div 
          className="absolute inset-0 opacity-[0.35] mix-blend-overlay pointer-events-none" 
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
          }}
        />
        {/* Subtle accent glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[40vw] max-w-[800px] max-h-[400px] bg-[#2ec4b6] opacity-[0.07] blur-[100px] rounded-full pointer-events-none" />
      </div>
      {/* Plain overlay — no mix-blend-mode, no compositor layer promotion */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
    </div>
  );
}
