/**
 * src/components/sections/Services.tsx
 */
import React, { useEffect, useRef } from "react";
import { gsap } from "../../lib/gsap";
import { ArrowUpRight } from "lucide-react";
import { services } from "../../data/services";

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef    = useRef<HTMLUListElement>(null);
  const revealRef  = useRef<HTMLDivElement>(null);
  const imgRefs    = useRef<(HTMLImageElement | null)[]>([]);
  const activeIdx  = useRef<number>(-1);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(revealRef.current, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });
      gsap.set(imgRefs.current[0], { opacity: 1 });
      activeIdx.current = 0;

      // Scroll reveal for list items
      const items = listRef.current?.children;
      if (items) {
        Array.from(items).forEach((item) => {
          gsap.fromTo(
            item,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, scrollTrigger: { trigger: item, start: "top 95%" } }
          );
        });
      }

      // Pre-compiled mouse tracker
      const xTo = gsap.quickTo(revealRef.current, "x", { duration: 0.5, ease: "power2.out" });
      const yTo = gsap.quickTo(revealRef.current, "y", { duration: 0.5, ease: "power2.out" });

      const moveReveal = (e: MouseEvent) => { xTo(e.clientX); yTo(e.clientY); };
      window.addEventListener("mousemove", moveReveal, { passive: true });
      return () => window.removeEventListener("mousemove", moveReveal);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleMouseEnter = (idx: number) => {
    if (activeIdx.current !== idx) {
      gsap.to(imgRefs.current[activeIdx.current], { opacity: 0, duration: 0.25 });
      gsap.to(imgRefs.current[idx],               { opacity: 1, duration: 0.25 });
      activeIdx.current = idx;
    }
    if (revealRef.current) revealRef.current.style.willChange = "transform";
    gsap.to(revealRef.current, { scale: 1, opacity: 1, duration: 0.3 });
  };

  const handleMouseLeave = () => {
    gsap.to(revealRef.current, {
      scale: 0, opacity: 0, duration: 0.3,
      onComplete: () => { if (revealRef.current) revealRef.current.style.willChange = "auto"; },
    });
  };

  return (
    <section ref={sectionRef} id="services" className="section-padding bg-[#050505] text-white relative z-10 overflow-hidden">

      {/* Hover reveal image panel */}
      <div
        ref={revealRef}
        className="fixed top-0 left-0 w-[300px] h-[400px] pointer-events-none z-50 hidden md:block rounded-sm overflow-hidden shadow-2xl"
      >
        {services.map((s, i) => (
          <img
            key={s.id}
            ref={(el) => { imgRefs.current[i] = el; }}
            src={s.image}
            alt={s.title}
            width={300}
            height={400}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0 }}
          />
        ))}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(46,196,182,0.4), rgba(212,225,87,0.2))" }}
        />
      </div>

      <div className="container relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start mb-20">
          <h2 className="text-6xl md:text-8xl font-bold mb-8 md:mb-0">
            Our<br /><span className="stroke-text">Expertise</span>
          </h2>
          <p className="max-w-xs text-sm uppercase tracking-wide text-white/40 pt-4 font-mono">
            Comprehensive creative solutions for forward-thinking brands — from strategy to screen.
          </p>
        </div>

        <ul ref={listRef} className="border-t border-white/10">
          {services.map((service, idx) => (
            <li
              key={service.id}
              className="group border-b border-white/10 relative overflow-hidden cursor-pointer"
              onMouseEnter={() => handleMouseEnter(idx)}
              onMouseLeave={handleMouseLeave}
            >
              <div
                className="absolute inset-0 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out"
                style={{ background: "linear-gradient(90deg, rgba(46,196,182,0.1), rgba(212,225,87,0.05))" }}
              />
              <div className="relative z-10 flex justify-between items-center py-12 px-4 group-hover:px-8 transition-all duration-500">
                <div className="flex items-baseline gap-8">
                  <span className="text-xs font-mono text-white/20 group-hover:text-[#2ec4b6] transition-colors">
                    {service.number}
                  </span>
                  <h3 className="text-2xl sm:text-3xl md:text-5xl group-hover:text-white transition-colors group-hover:translate-x-2 sm:group-hover:translate-x-4 duration-500">
                    {service.title}
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs uppercase tracking-widest opacity-0 md:opacity-100 group-hover:text-[#d4e157] transition-all transform translate-y-4 group-hover:translate-y-0 duration-500 delay-75 font-bold">
                    {service.category}
                  </span>
                  <ArrowUpRight className="w-8 h-8 text-white/20 group-hover:text-[#d4e157] group-hover:rotate-45 transition-all duration-500" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
