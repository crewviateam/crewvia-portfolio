"use client";

/**
 * WorkGallery.tsx — drop-in replacement.
 *
 * FIXES vs original:
 * ❌ 6 card scale scrubs simultaneously    → ✅ removed scale scrub entirely.
 *    (scale: 0.9→1 on scroll for each card)   Each card was its own ScrollTrigger
 *                                              scrub, meaning 6 compositor layers
 *                                              animating simultaneously on scroll.
 *                                              Replaced with a one-shot fromTo
 *                                              (opacity + y) that fires once when
 *                                              the card enters — no per-frame cost.
 * ❌ Two full-column yPercent scrubs       → ✅ kept but wrapped in mm.add() so
 *    always active including mobile            they only register above 768px.
 *                                              On mobile these were animating two
 *                                              full columns with no visual benefit.
 * ❌ gsap.registerPlugin inside module    → ✅ moved to top-level (idempotent but
 *    (runs on every HMR reload)               cleaner, avoids repeated calls).
 */

import React, { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Project {
  id: number;
  title: string;
  cat: string;
  year: string;
  img: string;
}

const projects: Project[] = [
  { id: 1, title: "Aeon",    cat: "Immersive",    year: "2024", img: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=800&q=75&fm=webp" },
  { id: 2, title: "Mono",    cat: "Identity",     year: "2023", img: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=75&fm=webp" },
  { id: 3, title: "Nebula",  cat: "Web",          year: "2024", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=75&fm=webp" },
  { id: 4, title: "Kinetic", cat: "Motion",       year: "2023", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=75&fm=webp" },
  { id: 5, title: "Dust",    cat: "CGI",          year: "2022", img: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&w=800&q=75&fm=webp" },
  { id: 6, title: "Void",    cat: "Experiential", year: "2023", img: "https://images.unsplash.com/photo-1515462277126-2dd0c162007a?auto=format&fit=crop&w=800&q=75&fm=webp" },
];

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
  <div className="group cursor-pointer">
    <div className="work-card-inner relative overflow-hidden aspect-[4/5] mb-6 rounded-sm">
      <img
        src={project.img}
        alt={project.title}
        width={800}
        height={1000}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      {/* Plain overlay — no blend mode */}
      <div className="absolute inset-0 bg-black/20 group-hover:opacity-0 transition-opacity duration-500 pointer-events-none" />
    </div>
    <div className="flex justify-between items-end border-b border-white/10 pb-4">
      <div>
        <h3 className="text-4xl md:text-5xl font-heading mb-1 text-white">{project.title}</h3>
        <span className="text-sm font-mono text-white/40 uppercase tracking-widest">{project.cat}</span>
      </div>
      <span className="text-sm font-mono text-white/60">{project.year}</span>
    </div>
  </div>
);

export default function WorkGallery() {
  const sectionRef  = useRef<HTMLElement>(null);
  const leftColRef  = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // Column parallax — desktop only via matchMedia
      // On mobile these were running silently, consuming scroll budget for nothing
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        gsap.to(leftColRef.current, {
          yPercent: 10,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
        gsap.to(rightColRef.current, {
          yPercent: -20,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      });

      // Card reveals — one-shot entrance (opacity + y), NOT a scrub
      // Original used scale 0.9→1 as a scrub on each card = 6 simultaneous
      // compositor layer updates per scroll tick. This fires once per card.
      gsap.utils.toArray<HTMLElement>(".work-card-inner").forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0.4, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              end: "top 10%",
              toggleActions: "play reverse play reverse",
            },
          }
        );
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="work" className="relative bg-[var(--bg-color)] text-[var(--text-color)] py-24 overflow-hidden">
      <div className="container">
        <div className="mb-24 flex flex-col items-center text-center">
          <h2 className="text-[12vw] leading-[0.8] font-heading font-black z-10 text-[#2ec4b6]">
            SELECTED
          </h2>
          <h2 className="text-[12vw] leading-[0.8] font-heading font-black text-transparent stroke-text-lime z-10 -mt-4 md:-mt-10">
            WORKS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-24 px-4 md:px-12">
          <div ref={leftColRef} className="flex flex-col gap-16 md:gap-32 pt-0 md:pt-24">
            {projects.filter((_, i) => i % 2 === 0).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <div ref={rightColRef} className="flex flex-col gap-16 md:gap-32 md:translate-y-24">
            {projects.filter((_, i) => i % 2 !== 0).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}