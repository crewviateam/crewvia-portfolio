import React, { useEffect, useRef } from "react";
import { NAV_LINKS } from "../../data/navigation";
import { trackCta } from "../../lib/analytics";
import { Link } from "react-router-dom";
import { gsap } from "../../lib/gsap";

const CONNECT = [
  { label: "LinkedIn",  href: "https://www.linkedin.com/company/crew-via/", external: true  },
  { label: "Instagram", href: "https://www.instagram.com/crewvia.official/",            external: true  },
  { label: "Email",     href: "mailto:hello@crewvia.in",                  external: false },
  { label: "Website",   href: "https://crewvia.in",                       external: true  },
] as const;

function LetsBuildLink() {
  const ref = useRef<HTMLAnchorElement>(null);

  return (
    <Link
      to="/contact"
      id="footer-lets-build"
      data-track="lets-build-cta"
      className="text-[8vw] md:text-[10vw] font-bold leading-none transition-all duration-300 relative block"
      style={{ WebkitTextStroke: "1.5px rgba(46,196,182,0.3)", color: "transparent" }}
      onClick={() => trackCta("lets_build")}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.color = "#2ec4b6";
        el.style.webkitTextStroke = "0px";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.color = "transparent";
        el.style.webkitTextStroke = "1.5px rgba(46,196,182,0.3)";
      }}
    >
      LET'S BUILD
    </Link>
  );
}

// 3D Animated Cubes
const CREWVIA_CUBES = [
  { letter: 'C', face: 'front', yOffset: 10, rz: 5 },   // Screen Front-Left
  { letter: 'R', face: 'left',  yOffset: -10, rz: -8 }, // Screen Front-Right
  { letter: 'E', face: 'front', yOffset: 5, rz: 6 },    // Screen Front-Left
  { letter: 'W', face: 'top',   yOffset: -20, rz: -10 },// Screen Top
  { letter: 'V', face: 'left',  yOffset: 15, rz: 12 },  // Screen Front-Right
  { letter: 'I', face: 'front', yOffset: -15, rz: -5 }, // Screen Front-Left
  { letter: 'A', face: 'left',  yOffset: 5, rz: 8 },    // Screen Front-Right
];

function AnimatedCubes() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const cubes = containerRef.current.querySelectorAll('.cube-wrapper');
    
    // Set initial hidden state immediately
    gsap.set(cubes, { y: -350, opacity: 0 });

    // Use IntersectionObserver to perfectly track when the cubes enter the actual viewport
    // This avoids GSAP ScrollTrigger layout shift bugs on initial page load
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          gsap.to(cubes, {
            y: 0,
            opacity: 1,
            duration: 1.0,
            stagger: 0.1,
            ease: "back.out(1.2)", // Replaced bounce.out with a premium, subtle heavy-landing effect
            overwrite: "auto"
          });
        } else {
          // Reset when scrolled out of view so it replays next time
          gsap.set(cubes, { y: -350, opacity: 0 });
        }
      });
    }, { 
      threshold: 0.3 // Trigger when 30% of the container is visible
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full mt-12 md:mt-16 border-t border-white/5 relative" style={{ clipPath: 'inset(0 -100vw -100vh -100vw)' }}>
      <div ref={containerRef} className="w-full flex justify-center items-center gap-[5vw] sm:gap-[6vw] md:gap-[5vw] pt-12 sm:pt-16 md:pt-20 pb-8 md:pb-10 flex-wrap" style={{ perspective: '2000px' }}>
        {CREWVIA_CUBES.map((item, index) => (
          <div key={index} className="cube-wrapper opacity-0">
            <div
              style={{ 
                '--s': 'clamp(2.2rem, 7.5vw, 8.5rem)', 
                '--hs': 'calc(var(--s) / 2)',
                transform: `translateY(${item.yOffset}px) rotateZ(${item.rz}deg)`,
              } as React.CSSProperties}
            >
              <div 
                className="w-[var(--s)] h-[var(--s)] relative" 
                style={{ 
                  transformStyle: 'preserve-3d', 
                  transform: 'rotateX(-35.264deg) rotateY(45deg)' 
                }}
              >
                {/* Top Face (Screen Top) */}
                <div 
                  className="absolute inset-0 bg-[#333333] flex items-center justify-center border border-white/5" 
                  style={{ transform: 'rotateX(90deg) translateZ(var(--hs))' }}
                >
                  {item.face === 'top' && <span className="text-white text-[clamp(1.5rem,4vw,4.5rem)] font-black transform rotate-90">{item.letter}</span>}
                </div>
                
                {/* Front Face (Screen Front-Left) */}
                <div 
                  className="absolute inset-0 bg-[#222222] flex items-center justify-center border border-white/5" 
                  style={{ transform: 'translateZ(var(--hs))' }}
                >
                  {item.face === 'front' && <span className="text-white text-[clamp(1.5rem,4vw,4.5rem)] font-black">{item.letter}</span>}
                </div>
                
                {/* Left Face (Screen Front-Right) */}
                <div 
                  className="absolute inset-0 bg-[#111111] flex items-center justify-center border border-white/5" 
                  style={{ transform: 'rotateY(-90deg) translateZ(var(--hs))' }}
                >
                  {item.face === 'left' && <span className="text-white text-[clamp(1.5rem,4vw,4.5rem)] font-black">{item.letter}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#0a0a0a] px-4 sm:px-8 md:px-12 lg:px-20 text-white pb-10 relative overflow-hidden">
      <div className="pt-16 md:pt-24 pb-12 container relative z-10">

        {/* CTA */}
        <div className="mb-16 md:mb-32 flex flex-col items-center text-center">
          <h2 className="text-[5vw] leading-none mb-8 font-serif-italic text-white/40">
            Have a project in mind?
          </h2>
          <LetsBuildLink />
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 pt-12 md:pt-16"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="col-span-1 sm:col-span-2">
            <img
              src="/image/logo.webp"
              alt="CREWVIA"
              width={150}
              height={48}
              loading="lazy"
              decoding="async"
              className="h-12 mb-6 object-contain"
              style={{ opacity: 0.8 }}
            />
            <p className="max-w-xs text-white/50 text-lg leading-relaxed">
              Creative Freedom, United Crew. A global creative studio specialising in brand identity, immersive web, film, and campaigns.
            </p>
          </div>

          <nav aria-label="Sitemap">
            <h4 className="text-xs font-bold uppercase tracking-widest mb-8" style={{ color: "#2ec4b6" }}>Sitemap</h4>
            <ul className="space-y-4 text-white/60 font-mono">
              {NAV_LINKS.map((item) => (
                <li key={item.label}>
                  <Link to={item.href.startsWith("#") ? `/${item.href}` : item.href} className="hover:text-[#d4e157] transition-colors text-lg">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-8" style={{ color: "#2ec4b6" }}>
              Connect
            </h4>
            <ul className="space-y-4 text-white/60 font-mono">
              {CONNECT.map(({ label, href, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    data-track={`footer-${label.toLowerCase()}`}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="hover:text-[#d4e157] transition-colors text-lg"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 3D Animated Cubes Section */}
        <AnimatedCubes />

        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] sm:text-xs text-white/40 uppercase tracking-widest font-mono border-t border-white/5 pt-6 md:pt-8 gap-4 sm:gap-0">
          <span className="text-center sm:text-left">© 2026 CREWVIA • Creative Freedom, United Crew</span>
          <div className="flex gap-4 sm:gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
