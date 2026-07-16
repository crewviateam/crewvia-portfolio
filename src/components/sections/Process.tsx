import React, { useEffect, useRef } from "react";
import { gsap } from "../../lib/gsap";
import { processSteps } from "../../data/process";

// Custom progressive Crewvia Logo (Actual Logo: Brackets + Plane)
const CrewviaLogoStep = ({ stepIndex }: { stepIndex: number }) => {
  const isDiscovery = stepIndex === 0;
  const isStrategy = stepIndex === 1;
  const isExecution = stepIndex === 2;
  const isLaunch = stepIndex === 3;

  // Colors based on exact logo extraction and brand theme
  const finalBlue = "#22409A";
  const matteGrey = "#2a2a2a";
  const blueprintLine = "#3acae4"; 
  const strategyGlow = "#E6F022";
  
  const getPathStyle = (isCursor: boolean = false) => {
    let fill = "transparent";
    let stroke = "transparent";
    let strokeWidth = "0";
    let filter = "none";
    let opacity = 1;

    if (isDiscovery) {
      // Step 1: Blueprint / Wireframe
      fill = "transparent";
      stroke = blueprintLine;
      strokeWidth = "0.75";
      opacity = 0.7;
    } else if (isStrategy) {
      // Step 2: Glowing curves for strategy
      fill = "transparent";
      stroke = strategyGlow;
      strokeWidth = "1.5";
      filter = "url(#glow)";
      opacity = 1;
    } else if (isExecution) {
      // Step 3: Matte Blender solid geometry
      fill = matteGrey;
      stroke = matteGrey; // Prevent subpixel gaps
      strokeWidth = "1";
      opacity = 1;
    } else if (isLaunch) {
      // Step 4: Final Brand Colors
      fill = isCursor ? "url(#cursor-gradient)" : finalBlue;
      stroke = isCursor ? "url(#cursor-gradient)" : finalBlue; 
      strokeWidth = isCursor ? "2" : "1";
      filter = isCursor ? "url(#glow)" : "none";
      opacity = 1;
    }

    return {
      fill,
      stroke,
      strokeWidth,
      filter,
      opacity,
      transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
      strokeLinejoin: "round" as const,
    };
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Background CAD Grid for Discovery (Step 0) */}
      <div 
        className={`absolute inset-0 transition-all duration-1000 ease-in-out ${isDiscovery ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        <svg viewBox="-10 -10 120 120" className="w-full h-full absolute inset-0 overflow-visible">
          {/* X and Y Axis */}
          <line x1="50" y1="-20" x2="50" y2="120" stroke={blueprintLine} strokeWidth="0.2" strokeDasharray="2 2" opacity="0.4" />
          <line x1="-20" y1="50" x2="120" y2="50" stroke={blueprintLine} strokeWidth="0.2" strokeDasharray="2 2" opacity="0.4" />
          {/* Construction Lines & Circles */}
          <circle cx="31" cy="24" r="15" stroke={blueprintLine} strokeWidth="0.2" strokeDasharray="1 3" fill="none" opacity="0.4" />
          <circle cx="85" cy="50" r="20" stroke={blueprintLine} strokeWidth="0.2" strokeDasharray="1 3" fill="none" opacity="0.4" />
          <line x1="-10" y1="63.2" x2="110" y2="24.5" stroke={blueprintLine} strokeWidth="0.2" opacity="0.4" /> {/* Parallel cut line */}
          
          {/* Node Points */}
          <circle cx="41" cy="9" r="1.5" fill={blueprintLine} opacity="0.6"/>
          <circle cx="16" cy="41.8" r="1.5" fill={blueprintLine} opacity="0.6"/>
          <circle cx="65" cy="9" r="1.5" fill={blueprintLine} opacity="0.6"/>
          <circle cx="100" cy="50" r="1.5" fill={blueprintLine} opacity="0.6"/>
        </svg>
      </div>

      {/* Strategy Nodes (Step 1) */}
      <div 
        className={`absolute inset-0 transition-all duration-1000 ease-in-out ${isStrategy ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
      >
        <svg viewBox="-10 -10 120 120" className="w-full h-full absolute inset-0 overflow-visible">
          {/* Glowing Vertex Points for Strategy Phase */}
          {[
            [41, 9], [16, 24], [31, 37], [65, 9], [90, 24], 
            [100, 42.5], [85, 60], [65, 91], [0, 60], [62, 40], [46, 97], [37, 72]
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="2" fill={strategyGlow} filter="url(#glow-sm)" className="animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
          <defs>
            <filter id="glow-sm" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
        </svg>
      </div>

      {/* Main Logo Shapes */}
      <svg viewBox="-10 -10 120 120" className="w-full h-full relative z-10 drop-shadow-2xl overflow-visible" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cursor-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00C2CB" />
            <stop offset="50%" stopColor="#A8E03F" />
            <stop offset="100%" stopColor="#E6F022" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g className="origin-center" style={{ transform: isLaunch ? 'scale(1)' : 'scale(0.95)', transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          {/* Left Bracket */}
          <path 
            d="M 41 9 L 31 9 A 15 15 0 0 0 16 24 L 16 41.8 L 31 37.0 L 31 29 A 5 5 0 0 1 36 24 L 41 24 Z"
            style={getPathStyle(false)}
          />

          {/* Right Brace */}
          <path 
            d="M 65 9 C 85 9, 90 15, 90 25 S 84 35, 85 40 C 86 42, 92 42.5, 100 42.5 L 100 57.5 C 92 57.5, 86 58, 85 60 S 90 65, 90 75 C 90 85, 85 91, 65 91 L 65 76 C 75 76, 75 70, 73 63 C 71 57.5, 80 57.5, 85 57.5 L 85 42.5 C 80 42.5, 71 42.5, 73 37 C 75 30, 75 24, 65 24 Z"
            style={getPathStyle(false)}
          />

          {/* Cursor / Plane */}
          <path 
            d="M 0 60 L 62 40 L 46 97 L 37 72 Z"
            style={getPathStyle(true)}
          />
        </g>
      </svg>
    </div>
  );
};

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!sectionRef.current || !cardsContainerRef.current) return;
    
    const ctx = gsap.context(() => {
      
      // Animate the entire container up to create a continuous simultaneous scroll
      gsap.to(cardsContainerRef.current, {
        y: () => -(cardsContainerRef.current?.offsetHeight || 0) - window.innerHeight,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${(cardsContainerRef.current?.offsetHeight || 0) + window.innerHeight}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        }
      });
      
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="process" className="relative w-full h-screen bg-[#141414] border-t border-white/5 overflow-hidden">
      
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none mix-blend-screen opacity-20 z-0">
        <div className="ambient-orb ambient-orb-teal absolute top-[10%] -left-[10%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px]"></div>
      </div>

      {/* Centered Background Text */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none px-4">
        <h2 className="text-3xl md:text-5xl lg:text-5xl font-bold text-white tracking-tight text-center max-w-4xl" style={{ lineHeight: 1.2 }}>
          A battle-tested process,<br/>perfected for digital products.
        </h2>
      </div>

      {/* Cards Scroll Container */}
      <div 
        ref={cardsContainerRef}
        className="absolute left-0 w-full flex flex-col items-center justify-start z-10 pointer-events-none"
        style={{ top: "100vh", gap: "40vh" }}
      >
        
        {processSteps.map((step, index) => {
          // Dynamic theme colors for each step's gradient glow
          const glowColors = ['from-[#2ec4b6]', 'from-[#24408e]', 'from-[#d4e157]', 'from-[#3acae4]'];
          
          return (
            <div 
              key={step.id} 
              className="glass-card relative overflow-hidden w-[90vw] max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl flex flex-col text-center pointer-events-auto border border-white/10"
            >
              {/* Grain Effect Overlay */}
              <div 
                className="absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none z-0" 
                style={{ 
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
                }}
              ></div>
              
              {/* Theme Gradient Glow Background */}
              <div className={`absolute -inset-[50%] opacity-[0.15] bg-gradient-to-br ${glowColors[index % glowColors.length]} to-transparent blur-3xl pointer-events-none rounded-full z-0`}></div>
              
              {/* Card Content */}
              <div className="relative z-10 pt-4">
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                    <span className="text-[#2ec4b6] mr-2">{step.number}.</span>{step.title}
                  </h3>
                </div>
                
                <p className="text-sm sm:text-base md:text-lg text-white/70 font-medium leading-relaxed mb-6 sm:mb-10">
                  {step.description}
                </p>

                {/* Dynamic Crewvia Logo Reveal */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 mx-auto flex items-center justify-center">
                  <CrewviaLogoStep stepIndex={index} />
                </div>
              </div>
            </div>
          );
        })}
        
      </div>

    </section>
  );
}
