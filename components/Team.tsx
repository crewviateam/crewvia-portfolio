import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';

const team = [
  { name: "Saifuddin", role: "Founder / Creative Director", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=75&fm=webp" },
  { name: "Design Lead", role: "Art Direction & Brand", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=75&fm=webp" },
  { name: "Tech Director", role: "Immersive Web & Dev", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=75&fm=webp" },
];

export default function Team() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".team-card", {
        y: 100,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%"
        }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section-padding bg-[var(--bg-color)] text-[var(--text-color)]">
      <div className="container">
        <div className="mb-24 text-center">
          <span
            className="text-xs font-mono uppercase tracking-widest px-4 py-2 rounded-full"
            style={{ border: '1px solid rgba(46,196,182,0.3)', color: '#2ec4b6' }}
          >
            The Crew
          </span>
          <h2 className="mt-8 text-5xl md:text-7xl">
            United<br/>
            <span className="stroke-text">Minds</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, i) => (
            <div key={i} className="team-card group cursor-pointer">
              <div className="relative overflow-hidden aspect-[3/4] mb-6 rounded-sm">
                <img 
                  src={member.img} 
                  alt={member.name} 
                  width="600"
                  height="800"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0" 
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'linear-gradient(to top, rgba(46,196,182,0.5), transparent)' }}
                ></div>
              </div>
              <div className="pt-4 flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-1" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 className="text-2xl font-serif-italic text-white">{member.name}</h3>
                <span className="text-[10px] sm:text-xs uppercase tracking-widest font-bold" style={{ color: '#d4e157' }}>{member.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}