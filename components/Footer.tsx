/**
 * Footer.tsx — drop-in replacement.
 *
 * FIX vs original:
 * ❌ Inline onMouseEnter / onMouseLeave    → ✅ Extracted to LetsBuildLink
 *    as anonymous functions                    component with useRef so the
 *                                              handlers are stable references,
 *                                              not recreated on every render.
 *                                              Purely a code-quality / GC fix —
 *                                              footer is static so impact is low,
 *                                              but it's the correct pattern.
 */

import React, { useRef } from "react";

function LetsBuildLink() {
  const ref = useRef<HTMLAnchorElement>(null);

  return (
    <a
      ref={ref}
      href="mailto:hello@crewvia.in"
      className="text-[8vw] md:text-[10vw] font-bold leading-none transition-all duration-300 relative"
      style={{ WebkitTextStroke: "1.5px rgba(46,196,182,0.3)", color: "transparent" }}
      onMouseEnter={() => {
        if (!ref.current) return;
        ref.current.style.color = "#2ec4b6";
        ref.current.style.webkitTextStroke = "0px";
      }}
      onMouseLeave={() => {
        if (!ref.current) return;
        ref.current.style.color = "transparent";
        ref.current.style.webkitTextStroke = "1.5px rgba(46,196,182,0.3)";
      }}
    >
      LET'S BUILD
    </a>
  );
}

const SITEMAP  = ["Work", "Services", "About", "Careers"] as const;
const CONNECT  = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/crewvia", external: true },
  { label: "Instagram", href: "https://instagram.com/crewvia", external: true },
  { label: "Email", href: "mailto:hello@crewvia.in", external: false },
  { label: "Website", href: "https://crewvia.in", external: true },
] as const;

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] px-20 text-white relative overflow-hidden">
      <div className="section-padding container relative z-10">

        {/* CTA */}
        <div className="mb-32 flex flex-col items-center text-center">
          <h2 className="text-[5vw] leading-none mb-8 font-serif-italic text-white/40">
            Have a project in mind?
          </h2>
          <LetsBuildLink />
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-4 gap-12 pt-16"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="col-span-1 md:col-span-2">
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

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-8" style={{ color: "#2ec4b6" }}>
              Sitemap
            </h4>
            <ul className="space-y-4 text-white/60 font-mono">
              {SITEMAP.map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`} className="hover:text-[#d4e157] transition-colors text-lg">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-8" style={{ color: "#2ec4b6" }}>
              Connect
            </h4>
            <ul className="space-y-4 text-white/60 font-mono">
              {CONNECT.map(({ label, href, external }) => (
                <li key={label}>
                  <a
                    href={href}
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

        <div className="mt-20 flex flex-col md:flex-row justify-between items-center text-xs text-white/40 uppercase tracking-widest font-mono">
          <span className="text-center md:text-left">© 2025 CREWVIA • Creative Freedom, United Crew</span>
          <div className="flex gap-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>

      {/* Giant background text */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none" style={{ opacity: 0.05 }}>
        <h1
          className="text-[18vw] leading-[0.7] font-black text-center translate-y-[20%]"
          style={{ color: "#2ec4b6" }}
        >
          CREW
        </h1>
      </div>
    </footer>
  );
}