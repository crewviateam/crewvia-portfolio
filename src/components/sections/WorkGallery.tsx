/**
 * src/components/sections/WorkGallery.tsx
 */
import React, { useEffect, useRef } from "react";
import { projects } from "../../data/projects";
import { gsap, ScrollTrigger } from "../../lib/gsap";
import { trackEvent, trackSectionView } from "../../lib/analytics";

export default function WorkGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const worksPinnedRef = useRef<HTMLDivElement>(null);
  const videoFrameRef = useRef<HTMLDivElement>(null);
  const contentPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || projects.length === 0) return;
    const WORKS_COUNT = projects.length;

    const ctx = gsap.context(() => {
      /* ─── HEADING REVEAL ─── */
      const headingTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#headingSection",
          start: "top 65%",
          once: true,
          onEnter: () => trackSectionView("work"),
        },
      });

      headingTl
        .to("#headingLabel", { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" })
        .to(
          "#headingSection .line span",
          {
            y: "0%",
            duration: 1.1,
            stagger: 0.15,
            ease: "expo.out",
          },
          "-=0.3"
        );

      /* ─── MASTER SCRUB TIMELINE FOR WORKS ─── */
      // Calculate total scroll distance needed to complete the animation
      // Phase 1 (scale): 1 part
      // Phase 2 (shift left & show content 0): 1 part
      // Phase 3 (wipes): (WORKS_COUNT - 1) parts
      const totalParts = 2 + (WORKS_COUNT - 1);
      const scrollDistance = totalParts * 120; // 120% of viewport height per part

      // Set initial states for timeline targets
      gsap.set(videoFrameRef.current, { xPercent: -50, yPercent: -50, left: "50%", top: "50%", scale: 0.45, opacity: 0 });
      gsap.set(".work-content-layer", { opacity: 0, y: 30 });
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: worksPinnedRef.current,
          start: "top top",
          end: `+=${scrollDistance}%`,
          scrub: 1,
          pin: true,
          pinSpacing: true, // Automatically adds spacer to the DOM so content below doesn't overlap
          invalidateOnRefresh: true, // Crucial for responsive x/y function recalculations
        },
      });

      // 1. Enter and Scale Up
      tl.to(videoFrameRef.current, { opacity: 1, scale: 1, duration: 1, ease: "none" });

      // 2. Shift Left (Desktop) or Up (Mobile) & Show Content 0
      tl.addLabel("shift");
      tl.to(videoFrameRef.current, { 
        x: () => window.innerWidth >= 768 ? -window.innerWidth * 0.22 : 0, 
        y: () => window.innerWidth >= 768 ? 0 : -window.innerHeight * 0.15,
        duration: 1, 
        ease: "power1.inOut" 
      }, "shift");
      tl.to(contentPanelRef.current, { opacity: 1, duration: 1, ease: "none" }, "shift");
      
      const contentLayers = gsap.utils.toArray<HTMLElement>(".work-content-layer");
      const dots = gsap.utils.toArray<HTMLElement>(".works-progress-dot");
      const vids = gsap.utils.toArray<HTMLElement>(".work-video-wrap");

      if (contentLayers[0]) {
        tl.to(contentLayers[0], { opacity: 1, y: 0, duration: 1, ease: "power1.out" }, "shift");
        contentLayers[0].classList.add("pointer-events-auto");
      }
      if (dots[0]) {
        tl.to(dots[0], { width: 44, backgroundColor: "#2ec4b6", duration: 1, ease: "power1.out" }, "shift");
      }

      // 3. Wipes for subsequent projects
      for (let i = 1; i < WORKS_COUNT; i++) {
        const wipeLabel = `wipe${i}`;
        tl.addLabel(wipeLabel);

        // Wipe image in from bottom
        tl.to(vids[i], { clipPath: "inset(0% 0 0% 0)", duration: 1, ease: "power1.inOut" }, wipeLabel);
        
        // Outgoing Content: Fade out and move up
        tl.to(contentLayers[i - 1], { opacity: 0, y: -30, duration: 0.5, ease: "power1.in" }, wipeLabel);
        // Incoming Content: Move from 30px down to 0 and fade in (starts halfway through the wipe)
        tl.fromTo(contentLayers[i], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: "power1.out" }, `${wipeLabel}+=0.5`);
        
        // Manage pointer events sequentially
        tl.call(() => {
          contentLayers.forEach(el => el.classList.remove("pointer-events-auto"));
          contentLayers[i].classList.add("pointer-events-auto");
        }, undefined, `${wipeLabel}+=0.5`);

        // Dot transition
        tl.to(dots[i - 1], { width: 28, backgroundColor: "rgba(255,255,255,0.2)", duration: 1, ease: "power1.inOut" }, wipeLabel);
        tl.to(dots[i], { width: 44, backgroundColor: "#2ec4b6", duration: 1, ease: "power1.inOut" }, wipeLabel);
      }

      // A tiny spacer at the end of the timeline so the last text rests for a moment before unpinning
      tl.to({}, { duration: 0.5 });

      ScrollTrigger.refresh();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  if (projects.length === 0) return null;

  return (
    <section ref={sectionRef} id="work" className="relative w-full bg-[var(--bg-color)] text-[var(--text-color)]">
      {/* SCOPED STYLES FOR COMPLEX CSS/CLIP-PATHS */}
      <style>{`
        .heading-wrap .line { display: block; overflow: hidden; }
        .heading-wrap .line span { display: block; transform: translateY(110%); }
        .stroke-text { color: transparent; -webkit-text-stroke: 1px var(--text-color); font-style: italic; font-weight: 400; }
        
        .work-video-wrap {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .work-content-layer {
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          pointer-events: none;
        }
        
        .works-progress-dot {
          width: 28px;
          height: 3px;
          background: rgba(255,255,255,0.2);
          border-radius: 2px;
        }
      `}</style>

      {/* HEADING SECTION */}
      <div id="headingSection" className="h-[90vh] flex items-center justify-center relative overflow-hidden">
        <div className="heading-wrap text-center relative z-[2]">
          <p id="headingLabel" className="text-xs md:text-sm tracking-[0.35em] uppercase text-[#2ec4b6] mb-6 opacity-0 translate-y-5 font-bold">
            Portfolio — 2024
          </p>
          <h2 className="text-[clamp(4rem,11vw,10rem)] font-black leading-[0.9] tracking-tight">
            <span className="line"><span>Selected</span></span>
            <span className="line"><span className="stroke-text">Works</span></span>
          </h2>
        </div>
      </div>

      {/* WORKS SECTION - PINNED CONTAINER */}
      <div ref={worksPinnedRef} className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-[var(--bg-color)]">
        <div className="relative w-full h-full flex items-center justify-center">
          
          {/* VIDEO FRAME (Images) */}
          <div
            ref={videoFrameRef}
            className="absolute w-[85vw] md:w-[55vw] max-w-[800px] aspect-[4/5] md:aspect-[16/9] rounded-xl overflow-hidden z-10 shadow-[0_40px_100px_rgba(0,0,0,0.7)] will-change-transform"
          >
            <div className="absolute inset-0 w-full h-full">
              {projects.map((project, i) => (
                <div
                  key={project.id}
                  id={`vid${i}`}
                  className="work-video-wrap"
                  style={{ clipPath: i === 0 ? "inset(0 0 0% 0)" : "inset(100% 0 0% 0)" }}
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    loading={i === 0 ? "eager" : "lazy"}
                    className="w-full h-full object-cover block"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* CONTENT PANEL */}
          <div
            ref={contentPanelRef}
            className="absolute left-[7.5vw] md:left-auto md:right-[5vw] bottom-[10vh] md:bottom-auto md:top-1/2 md:-translate-y-1/2 w-[85vw] md:w-[26vw] min-w-[240px] opacity-0 z-20"
          >
            <div className="relative w-full h-full">
              {projects.map((project, i) => (
                <div
                  key={project.id}
                  className="work-content-layer flex flex-col justify-end md:justify-center h-full"
                >
                  <p className="text-[10px] tracking-[0.3em] text-[#2ec4b6] uppercase mb-4 font-bold drop-shadow-md">
                    0{i + 1} / 0{projects.length}
                  </p>
                  <h3 className="text-[clamp(1.5rem,6vw,2.6rem)] font-black leading-[1.05] tracking-tight mb-3 md:mb-5 text-white drop-shadow-md">
                    {project.title}
                  </h3>
                  {/* Using category/year as desc or blank if none */}
                  <p className="text-xs md:text-sm leading-[1.6] md:leading-[1.75] text-white/80 mb-4 md:mb-8 drop-shadow-md">
                    An immersive {project.category.toLowerCase()} experience created in {project.year}. Designed with meticulous attention to detail and interaction.
                  </p>
                  
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 md:mb-8">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 border border-white/20 bg-black/40 backdrop-blur-sm rounded-full text-white/80"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => trackEvent("project_hover", { project_id: project.id, project_title: project.title })}
                    className="inline-flex items-center gap-2.5 text-xs font-bold tracking-[0.12em] uppercase text-[#2ec4b6] group transition-all drop-shadow-md w-fit"
                  >
                    View Case Study
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 transition-transform group-hover:translate-x-1">
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* PROGRESS DOTS */}
          <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-30">
            {projects.map((_, i) => (
              <div
                key={i}
                className="works-progress-dot"
                style={i === 0 ? { width: "44px", backgroundColor: "#2ec4b6" } : {}}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

