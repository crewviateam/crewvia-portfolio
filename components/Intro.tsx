import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';

export default function Intro() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const lines = gsap.utils.toArray('.intro-line-wrap');
      
      lines.forEach((line: any) => {
        gsap.fromTo(line.querySelectorAll('.char'), 
          { y: 100, opacity: 0, rotateX: -90 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            stagger: 0.02,
            duration: 1,
            ease: "power4.out",
            scrollTrigger: {
              trigger: line,
              start: "top 80%",
              end: "top 20%",
              toggleActions: "play reverse play reverse",
            }
          }
        );
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 md:py-56 bg-[#050505] text-white overflow-hidden px-4">
      <div className="container mx-auto">
        
        <div className="flex flex-col text-[7vw] md:text-[6vw] leading-[1.1] font-heading uppercase font-bold tracking-tight">
          
          <div className="intro-line-wrap overflow-hidden flex flex-wrap items-baseline gap-4">
             <span className="char">We</span>
             <span className="char font-serif italic font-light text-white/30 lowercase">don't just</span>
             <span className="char">craft</span>
          </div>
 
          <div className="intro-line-wrap overflow-hidden flex flex-wrap items-baseline gap-4 pl-[5vw]">
             <span className="char stroke-text">Creative</span>
             <span className="char" style={{ color: '#d4e157' }}>Campaigns.</span>
          </div>
 
          <div className="intro-line-wrap overflow-hidden flex flex-wrap items-baseline gap-4">
             <span className="char">We</span>
             <span className="char font-serif italic font-light text-white lowercase">build</span>
             <span className="char" style={{ color: '#2ec4b6' }}>Legacies.</span>
          </div>
 
        </div>
 
        <div className="mt-32 w-full flex justify-end">
          <div className="w-full md:w-1/3 text-lg md:text-xl font-light text-white/60 font-mono leading-relaxed pl-8"
            style={{ borderLeft: '2px solid #2ec4b6' }}>
            <p>
              In the age of templates, <span className="text-white italic font-serif">creative freedom is currency</span>. We strip away the non-essential to reveal the raw, beating heart of your brand — and unite a crew to bring it to life.
            </p>
          </div>
        </div>
 
      </div>
    </section>
  );
}