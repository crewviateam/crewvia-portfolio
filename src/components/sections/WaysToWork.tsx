import { useEffect, useRef } from "react";
import { gsap } from "../../lib/gsap";

export default function WaysToWork() {
  const sectionRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".wtw-fade", {
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

    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const models = [
    {
      id: "01",
      title: "Project Based",
      desc: "Good for one-off launches, MVPs, brand identities, and marketing sites. You get a fixed scope, a fixed timeline, and a fixed price, with weekly demos and a senior team running it end to end. Start here if you already know exactly what you need built.",
      glowColor: "from-[#2ec4b6]/0 group-hover:from-[#2ec4b6]/10"
    },
    {
      id: "02",
      title: "Retainer",
      desc: "Built for funded startups and growing SMBs who need an ongoing design and dev partner. You get a dedicated pod embedded into your team, Slack access, weekly priorities, and no scope theatre. Start here if you're shipping continuously and tired of managing freelancers.",
      glowColor: "from-[#d4e157]/0 group-hover:from-[#d4e157]/10"
    },
    {
      id: "03",
      title: "Hourly",
      desc: "Made for advisory, audits, design sprints, and technical reviews. You get direct access to our seniors at hourly rates, with no minimum commitment. Start here if you need an expert opinion before committing to something bigger.",
      glowColor: "from-white/0 group-hover:from-white/5"
    }
  ];

  return (
    <section ref={sectionRef} id="ways-to-work" className="section-padding w-full bg-[var(--bg-color)] relative z-10 overflow-hidden">
      
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none mix-blend-screen opacity-30 z-0">
        <div className="ambient-orb ambient-orb-teal absolute top-[20%] -right-[10%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px]"></div>
        <div className="ambient-orb ambient-orb-lime absolute bottom-[10%] -left-[10%] w-[40vw] h-[40vw] max-w-[400px] max-h-[400px]"></div>
      </div>

      <div className="container relative z-10">
        
        {/* Standardized Section Header */}
        <div className="section-header wtw-fade">
          <h2 className="section-title">
            WORK<br /><span className="stroke-text">MODELS</span>
          </h2>
          <div className="section-meta">
            <span className="section-label">Three Ways to Work</span>
            <p className="section-desc">
              No 12-month retainers with vague scopes. No mystery invoices. Pick the model that fits your stage, change it when your stage changes.
            </p>
          </div>
        </div>

        {/* 3-Column Glassmorphic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          
          {models.map((model, i) => (
            <div key={i} className="wtw-fade h-full">
              <div className="glass-card group h-full flex flex-col">
                {/* Internal Glow on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${model.glowColor} to-transparent transition-all duration-700 pointer-events-none`}></div>
                
                {/* Giant Typographic Watermark */}
                <div className="absolute -bottom-8 -right-4 text-[12rem] md:text-[14rem] font-black text-white/[0.02] group-hover:text-white/[0.04] transition-colors duration-700 leading-none pointer-events-none select-none z-0">
                  {model.id}
                </div>
                
                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-8">
                    <div className="text-sm font-mono text-white/40 uppercase tracking-[0.2em] mb-4">Model {model.id}</div>
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white">{model.title}</h3>
                  </div>
                  
                  <div className="mt-auto pt-8 border-t border-white/10">
                    <p className="text-sm md:text-base text-white/60 font-light leading-relaxed">
                      {model.desc}
                    </p>
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
