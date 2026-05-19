/**
 * src/components/layout/Header.tsx
 */
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "../../lib/gsap";
import { NAV_LINKS, CONTACT_LINK } from "../../data/navigation";

export default function Header() {
  const headerRef              = useRef<HTMLElement>(null);
  const logoRef                = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(logoRef.current, {
        y: -50, opacity: 0, duration: 1, ease: "power3.out", delay: 0.2,
      });
    }, headerRef);
    return () => ctx.revert();
  }, []);

  return (
    <header ref={headerRef} className="fixed top-0 left-0 w-full z-[100] transition-all duration-500">
      <div className="container mx-auto px-4 sm:px-8 py-6 md:py-8 flex justify-between items-center">

        <div ref={logoRef} className="flex items-center gap-4 z-[101]">
          <a href="#" className="relative group">
            <img
              src="/image/logo.webp"
              alt="CREWVIA"
              width={150}
              height={48}
              className="h-10 md:h-12 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </a>
        </div>

        {/* Desktop nav */}
        <nav
          className="hidden md:flex items-center gap-10 bg-white/8 px-10 py-4 rounded-full border border-white/10 shadow-sm"
          aria-label="Primary navigation"
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-xs uppercase tracking-[0.2em] font-bold text-white/60 hover:text-[#2ec4b6] transition-colors relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-[#2ec4b6] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-6 z-[101]">
          <a
            href={CONTACT_LINK.href}
            className="hidden sm:block text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] px-6 py-3 rounded-full transition-all duration-300 shadow-sm"
            style={{ background: "linear-gradient(135deg, #2ec4b6, #d4e157)", color: "#050505" }}
          >
            {CONTACT_LINK.label}
          </a>

          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
            <div className={`w-4 h-0.5 bg-white transition-all duration-300 ml-auto ${mobileOpen ? "opacity-0" : ""}`} />
            <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed inset-0 bg-[#050505] z-[100] flex flex-col items-center justify-center transition-all duration-700 ease-out ${
          mobileOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex flex-col gap-8 text-center">
          {[...NAV_LINKS, { href: "#contact", label: "Contact" }].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-4xl sm:text-5xl font-heading font-black uppercase tracking-tight hover:text-[#2ec4b6] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
