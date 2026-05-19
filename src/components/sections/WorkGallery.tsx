/**
 * src/components/sections/WorkGallery.tsx
 */
import React, { useEffect, useRef } from "react";
import { projects } from "../../data/projects";
import { gsap } from "../../lib/gsap";
import type { Project } from "../../types";
import { trackEvent, trackSectionView } from "../../lib/analytics";

const ProjectCard: React.FC<{ project: Project; onHover: () => void }> = ({ project, onHover }) => (
  <div className="group cursor-pointer" onMouseEnter={onHover}>
    <div className="work-card-inner relative overflow-hidden aspect-[4/5] mb-6 rounded-sm">
      <img
        src={project.image}
        alt={project.title}
        width={800}
        height={1000}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/20 group-hover:opacity-0 transition-opacity duration-500 pointer-events-none" />
    </div>
    <div className="flex justify-between items-end border-b border-white/10 pb-4">
      <div>
        <h3 className="text-4xl md:text-5xl font-heading mb-1 text-white">{project.title}</h3>
        <span className="text-sm font-mono text-white/40 uppercase tracking-widest">{project.category}</span>
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
      // Column parallax — desktop only (no per-frame cost on mobile)
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        gsap.to(leftColRef.current, {
          yPercent: 10, ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: 1,
            onEnter: () => trackSectionView("work"),
          },
        });
        gsap.to(rightColRef.current, {
          yPercent: -20, ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: 1 },
        });
      });

      // Card reveals — replays every time card enters view
      gsap.utils.toArray<HTMLElement>(".work-card-inner").forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0.4, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.9, ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              // end: "top 5%",
              // toggleActions: "play reverse play reverse",
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
          <h2 className="text-[12vw] leading-[0.8] font-heading font-black z-10 text-[#2ec4b6]">SELECTED</h2>
          <h2 className="text-[12vw] leading-[0.8] font-heading font-black text-transparent stroke-text-lime z-10 -mt-4 md:-mt-10">WORKS</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-24 px-4 md:px-12">
          <div ref={leftColRef} className="flex flex-col gap-16 md:gap-32 pt-0 md:pt-24">
            {projects.filter((_, i) => i % 2 === 0).map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onHover={() => trackEvent("project_hover", { project_id: project.id, project_title: project.title })}
              />
            ))}
          </div>
          <div ref={rightColRef} className="flex flex-col gap-16 md:gap-32 md:translate-y-24">
            {projects.filter((_, i) => i % 2 !== 0).map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onHover={() => trackEvent("project_hover", { project_id: project.id, project_title: project.title })}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
