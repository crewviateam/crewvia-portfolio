/**
 * src/components/sections/Team.tsx
 */
import React, { useEffect, useRef } from "react";
import { gsap } from "../../lib/gsap";
import { team } from "../../data/team";

export default function Team() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".team-card", {
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          once: true,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="team" className="section-padding bg-[var(--bg-color)] text-[var(--text-color)] relative overflow-hidden">
      
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none mix-blend-screen opacity-20 z-0">
        <div className="ambient-orb ambient-orb-lime absolute bottom-[10%] right-[10%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px]"></div>
      </div>

      <div className="container relative z-10">
        {/* Standardized Section Header */}
        <div className="section-header team-card">
          <h2 className="section-title">
            THE<br /><span className="stroke-text">TEAM</span>
          </h2>
          <div className="section-meta">
            <span className="section-label">Leadership</span>
            <p className="section-desc">
              Misfits, mavericks, and makers. We operate as a tight-knit collective of specialists, united by a singular obsession with craft.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {team.map((member, i) => (
            <div key={member.id} className="team-card glass-card-sm group cursor-pointer">
              <div className="relative overflow-hidden aspect-[3/4] mb-6 rounded-xl">
                <img
                  src={member.image}
                  alt={member.name}
                  width={600}
                  height={800}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "linear-gradient(to top, rgba(46,196,182,0.5), transparent)" }}
                />
              </div>
              <div
                className="pt-4 flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-1"
                style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
              >
                <h3 className="text-2xl font-serif-italic text-white">{member.name}</h3>
                <span className="text-[10px] sm:text-xs uppercase tracking-widest font-bold" style={{ color: "#d4e157" }}>
                  {member.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
