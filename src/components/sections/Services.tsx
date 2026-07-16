import React, { useState, useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../../lib/gsap";
import { services } from "../../data/services";
import MagneticButton from "../ui/MagneticButton";

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);

  useEffect(() => {
    if (activeIndex !== displayIndex) {
      let isCancelled = false;
      
      gsap.killTweensOf(contentRef.current);
      gsap.to(contentRef.current, {
        y: -15, 
        opacity: 0, 
        duration: 0.15, // Faster exit
        ease: "power2.inOut",
        onComplete: () => {
          if (!isCancelled) {
            setDisplayIndex(activeIndex);
            gsap.fromTo(contentRef.current, 
              { y: 15, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.3, ease: "power2.out", clearProps: "transform" }
            );
          }
        }
      });
      
      return () => {
        isCancelled = true;
      };
    }
  }, [activeIndex, displayIndex]);

  useEffect(() => {
    if (!sectionRef.current || !containerRef.current) return;
    
    const isMobile = window.innerWidth < 1024;
    let ctx = gsap.context(() => {
      if (isMobile) return;
      
      ScrollTrigger.create({
        id: "services-pin",
        trigger: sectionRef.current,
        start: "top top",
        end: "+=2000",
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;
          let newIndex = 0;
          if (progress > 0.33 && progress <= 0.66) newIndex = 1;
          if (progress > 0.66) newIndex = 2;
          
          setActiveIndex((prev) => {
            if (prev !== newIndex) return newIndex;
            return prev;
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleTabClick = (idx: number) => {
    setActiveIndex(idx);
    
    const isMobile = window.innerWidth < 1024;
    if (!isMobile) {
      const st = ScrollTrigger.getById("services-pin");
      if (st) {
        let targetProgress = 0;
        if (idx === 0) targetProgress = 0.16;
        if (idx === 1) targetProgress = 0.5;
        if (idx === 2) targetProgress = 0.83;
        
        const targetScroll = st.start + (st.end - st.start) * targetProgress;
        window.scrollTo({ top: targetScroll, behavior: "smooth" });
      }
    }
  };

  const activeService = services[displayIndex];

  return (
    <section ref={sectionRef} id="services" className="relative w-full bg-[#050505] text-white">
      {/* Pinned Container */}
      <div ref={containerRef} className="min-h-screen flex items-center justify-center section-padding">
        <div className="container relative z-10 w-full h-full max-w-[1600px] flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          {/* LEFT COLUMN: Tabs */}
          <div className="w-full lg:w-5/12 flex flex-col justify-center">
            <div className="mb-12 lg:mb-24">
              <h2 className="text-[clamp(3rem,6vw,5.5rem)] font-heading font-black uppercase leading-[0.85] tracking-tight">
                OUR<br /><span className="stroke-text">SERVICES</span>
              </h2>
            </div>

            <div className="flex flex-col gap-2">
              {services.map((service, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <button
                    key={service.id}
                    onClick={() => handleTabClick(idx)}
                    className="group text-left py-4 sm:py-6 border-b border-white/10 transition-colors duration-300 relative overflow-hidden"
                  >
                    <div className="relative z-10 flex items-center gap-4 sm:gap-6">
                      <div className={`w-3 h-3 flex-shrink-0 transition-colors duration-300 ${isActive ? 'bg-[#d4e157]' : 'bg-white/10 group-hover:bg-[#2ec4b6]/50'}`} />
                      <span className={`text-xl sm:text-2xl md:text-3xl font-bold uppercase transition-colors duration-300 ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`}>
                        {service.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-16 hidden lg:flex justify-start">
              <MagneticButton href="/contact" text="Let's Talk" cursorText="START" />
            </div>
          </div>

          {/* RIGHT COLUMN: Content */}
          <div className="w-full lg:w-7/12 flex flex-col justify-center relative min-h-[600px]">
            <div className="glass-card w-full h-full flex flex-col justify-center transition-colors duration-1000 border-white/10">
                <div ref={contentRef} className="w-full flex flex-col">
                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 uppercase tracking-tight text-white">
                    {activeService.title}
                  </h3>
                  <p className="text-base sm:text-lg text-white/70 font-medium leading-relaxed max-w-2xl mb-12">
                    {activeService.description}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 border-t border-white/10 pt-8">
                    {activeService.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#2ec4b6]/50" />
                        <span className="text-sm font-semibold uppercase tracking-wider text-white/80">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
          </div>
          
          <div className="mt-12 flex lg:hidden justify-center w-full">
            <MagneticButton href="/contact" text="Let's Talk" cursorText="START" />
          </div>

        </div>
      </div>
    </section>
  );
}
