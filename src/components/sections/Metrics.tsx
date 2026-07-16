import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../../lib/gsap";

export default function Metrics() {
  const sectionRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      
      // 1. Background Ambient Orbs Animation
      const orb1 = gsap.to(".ambient-orb-1", {
        x: "15vw",
        y: "10vh",
        duration: 25,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        paused: true
      });
      
      const orb2 = gsap.to(".ambient-orb-2", {
        x: "-15vw",
        y: "-10vh",
        duration: 30,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        paused: true
      });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        onEnter: () => { orb1.play(); orb2.play(); },
        onLeave: () => { orb1.pause(); orb2.pause(); },
        onEnterBack: () => { orb1.play(); orb2.play(); },
        onLeaveBack: () => { orb1.pause(); orb2.pause(); },
      });

      // 2. Fade in Content Elements
      gsap.from(".glass-fade", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          once: true,
        },
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power3.out"
      });

      // 3. Count Up Numbers
      const numbers = gsap.utils.toArray<HTMLElement>(".metric-number");
      numbers.forEach((num) => {
        const targetValue = parseInt(num.getAttribute("data-value") || "0", 10);
        gsap.to(num, {
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
          innerText: targetValue,
          duration: 3,
          snap: { innerText: 1 },
          ease: "power3.out",
          onUpdate: function() {
            const suffix = num.getAttribute("data-suffix") || "";
            num.innerText = Math.ceil(Number(num.innerText)) + suffix;
          }
        });
      });

    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="metrics" className="section-padding w-full bg-[var(--bg-color)] relative overflow-hidden">
      
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none mix-blend-screen opacity-50 z-0">
        <div className="ambient-orb ambient-orb-teal absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] ambient-orb-1"></div>
        <div className="ambient-orb ambient-orb-lime absolute bottom-[0%] right-[0%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] ambient-orb-2"></div>
      </div>

      <div className="container relative z-10">
        
        {/* Standardized Section Header */}
        <div className="section-header glass-fade">
          <h2 className="section-title">
            OUR<br /><span className="stroke-text">IMPACT</span>
          </h2>
          <div className="section-meta">
            <span className="section-label">Metrics</span>
            <p className="section-desc">
              We don't just build pretty things. We build digital assets that drive measurable business growth and market domination.
            </p>
          </div>
        </div>

        {/* Glassmorphic 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          
          {[
            { value: "24", suffix: "+", title: "Projects", label: "Delivered with absolute precision since launch." },
            { value: "99", suffix: "%", title: "Satisfaction", label: "Client satisfaction rate across board." },
            { value: "3", suffix: "", title: "Founders", label: "Engineers who design-think leading the charge." },
            { value: "5", suffix: "x", title: "Impact", label: "Average ROI achieved post-launch." },
          ].map((metric, i) => (
            <div key={i} className="glass-fade h-full">
              <div className="glass-card group h-full flex flex-col justify-between">
                {/* Internal subtle glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#2ec4b6]/0 to-transparent group-hover:from-[#2ec4b6]/5 transition-all duration-700 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px] md:min-h-[200px]">
                  <div>
                    <div className="text-xs font-mono text-[#2ec4b6] uppercase tracking-[0.2em] mb-2 font-bold">{metric.title}</div>
                    <div className="text-sm md:text-base opacity-60 font-light leading-relaxed">
                      {metric.label}
                    </div>
                  </div>
                  
                  {/* Massive Typography Focus */}
                  <div 
                    className="metric-number text-[5rem] md:text-[6.5rem] lg:text-[7.5rem] leading-none font-black text-transparent bg-clip-text mt-8 md:mt-12"
                    style={{ backgroundImage: "linear-gradient(135deg, #ffffff, #555555)" }}
                    data-value={metric.value}
                    data-suffix={metric.suffix}
                  >
                    0{metric.suffix}
                  </div>
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
