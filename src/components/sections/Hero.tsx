/**
 * src/components/sections/Hero.tsx
 *
 * Performance: zero backdrop-filter, zero CSS filter on animated elements.
 * Glass look achieved via layered CSS radial-gradients (single paint call).
 */
import { useEffect, useRef } from "react";
import { gsap } from "../../lib/gsap";
import { trackSectionView } from "../../lib/analytics";
import MagneticButton from "../ui/MagneticButton";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef     = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Character entrance — GSAP manages will-change internally
      gsap.set(".hero-char", { yPercent: 120, rotateZ: 10 });
      gsap.timeline().to(".hero-char", {
        yPercent: 0, rotateZ: 0,
        stagger: 0.05, duration: 1.2, ease: "power4.out", delay: 0.5,
      });

      // Secondary elements fade in
      gsap.from(".hero-fade", { opacity: 0, y: 20, duration: 1, stagger: 0.2, delay: 1 });

      // Parallax — yPercent only (no scale re-compositing)
      gsap.to(".hero-bg", {
        yPercent: 20, force3D: true,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top", end: "bottom top", scrub: true,
          onEnter: () => trackSectionView("hero"),
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-[var(--bg-color)] text-[var(--text-color)]"
    >
      {/* ── Background system: layered gradients, zero GPU filter cost ── */}
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">

        {/* Hero image — yPercent only parallax */}
        <div className="hero-bg absolute inset-0 opacity-25 pointer-events-none">
          <img
            src="/image/hero_bg.webp"
            alt=""
            role="presentation"
            width={1920}
            height={1080}
            decoding="async"
            fetchPriority="high"
            className="w-full h-full object-cover grayscale contrast-150"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, var(--bg-color) 0%, transparent 20%, transparent 65%, var(--bg-color) 100%)" }}
          />
        </div>

        {/* Color atmosphere — 3 gradients in 1 background prop = 1 paint call */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 75% 65% at 22% 40%,  rgba(46,196,182,0.42)  0%, transparent 68%),
              radial-gradient(ellipse 70% 60% at 78% 60%,  rgba(212,225,87,0.36)  0%, transparent 68%),
              radial-gradient(ellipse 55% 50% at 50% 50%,  rgba(126,200,138,0.18) 0%, transparent 65%)
            `,
          }}
        />

        {/* Dark veil */}
        <div className="absolute inset-0 pointer-events-none bg-black/50" />

        {/* Glass sheen — no backdrop-filter */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(160deg, rgba(46,196,182,0.07) 0%, rgba(255,255,255,0.03) 30%, rgba(126,200,138,0.04) 55%, rgba(212,225,87,0.06) 100%)`,
          }}
        />

        {/* Hairline top highlight */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
          style={{ background: "linear-gradient(90deg, rgba(46,196,182,0.25), rgba(212,225,87,0.18))" }}
        />

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 w-full h-[40vh] pointer-events-none z-[5]"
          style={{ background: "linear-gradient(to top, var(--bg-color) 0%, transparent 100%)" }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 sm:p-6 md:p-12">

        {/* Top bar */}
        <div className="flex justify-between items-start hero-fade pt-20 md:pt-24">
          <div className="flex flex-col gap-2 md:gap-3">
            {/* Kept minimal left anchor for balance if needed, or empty space */}
            <div className="w-10"></div>
          </div>

          <div className="hidden md:flex text-right flex-col items-end gap-2 md:gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider opacity-60 text-white">Taking on new projects</span>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#d4e157" }} aria-label="Currently accepting new projects" />
            </div>
            <div className="text-xs font-mono uppercase tracking-wider opacity-60 text-white">Global · Remote</div>
          </div>
        </div>

        {/* Title + bottom bar */}
        <div className="relative mb-8 md:mb-12">
          <h1
            ref={titleRef}
            className="text-[clamp(3rem,14vw,12rem)] sm:text-[clamp(3rem,12vw,10rem)] md:text-[clamp(4rem,10vw,9rem)] leading-[0.95] font-heading font-black tracking-tight"
            aria-label="CREWVIA"
          >
            <div className="flex flex-wrap overflow-hidden">
              {"CREW".split("").map((char, i) => (
                <span key={i} className="hero-char inline-block origin-bottom" style={{ color: "#2ec4b6" }}>
                  {char}
                </span>
              ))}
              {"VIA".split("").map((char, i) => (
                <span key={i + 4} className="hero-char inline-block origin-bottom" style={{ color: "#d4e157" }}>
                  {char}
                </span>
              ))}
            </div>
          </h1>

          <div className="flex flex-col md:flex-row md:items-end justify-between mt-6 md:mt-10 border-t border-white/10 pt-4 md:pt-8 hero-fade gap-4 md:gap-6">
            <div className="flex-1 max-w-2xl">
              <p className="text-sm sm:text-base md:text-lg lg:text-2xl font-serif-italic text-white/80 leading-snug mb-4 md:mb-6">
                "Creative Freedom, United Crew — we build brand identities that scale, websites that convert, and robust engineering stacks."
              </p>
              {/* Services grid removed for cleaner hero density */}
            </div>
            <div className="flex-shrink-0">
              <MagneticButton href="#work" id="hero-explore-work" text="Explore Work" cursorText="VIEW" ctaName="explore_work" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
