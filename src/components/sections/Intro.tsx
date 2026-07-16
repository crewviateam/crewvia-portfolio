/**
 * src/components/sections/Intro.tsx
 */
import { useEffect, useRef } from "react";
import { gsap } from "../../lib/gsap";

export default function Intro() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const lines = gsap.utils.toArray<HTMLElement>(".intro-line-wrap");

      lines.forEach((line) => {
        gsap.fromTo(
          line.querySelectorAll(".char"),
          { y: 60, opacity: 0, rotateX: -60 },
          {
            y: 0, opacity: 1, rotateX: 0,
            stagger: 0.015, duration: 0.6, ease: "power4.out",
            scrollTrigger: {
              trigger: line,
              start: "top 90%",
              once: true,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section-padding bg-[#050505] text-white overflow-hidden px-4 sm:px-6">
      <div className="container mx-auto">

        <div className="flex flex-col text-[clamp(2rem,7vw,6rem)] md:text-[6vw] leading-[1.1] font-heading uppercase font-bold tracking-tight">

          <div className="intro-line-wrap overflow-hidden flex flex-wrap items-baseline gap-4">
            <span className="char">We</span>
            <span className="char font-serif italic font-light text-white/30 lowercase">don't just</span>
            <span className="char">craft</span>
          </div>

          <div className="intro-line-wrap overflow-hidden flex flex-wrap items-baseline gap-4 pl-[5vw]">
            <span className="char stroke-text">Creative</span>
            <span className="char" style={{ color: "#d4e157" }}>Campaigns.</span>
          </div>

          <div className="intro-line-wrap overflow-hidden flex flex-wrap items-baseline gap-4">
            <span className="char">We</span>
            <span className="char font-serif italic font-light text-white lowercase">build</span>
            <span className="char" style={{ color: "#2ec4b6" }}>Legacies.</span>
          </div>

        </div>

        <div className="mt-32 w-full flex justify-end">
          <div
            className="w-full md:w-2/5 text-base md:text-xl font-light text-white/60 font-mono leading-relaxed pl-6 md:pl-8"
            style={{ borderLeft: "2px solid #2ec4b6" }}
          >
            <p>
              Founded in October 2025 and driven by three core founders, <span className="text-white italic font-serif">creative freedom is our currency</span>. We strip away the non-essential to reveal the raw, beating heart of your brand — and unite a crew to bring it to life.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
