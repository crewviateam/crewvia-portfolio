import React, { useEffect, useRef, useState } from "react";
import { gsap } from "../../lib/gsap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { NAV_LINKS, CONTACT_LINK } from "../../data/navigation";

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMobileOpen(false);
    
    if (href.startsWith("#")) {
      e.preventDefault();
      
      if (location.pathname !== "/") {
        navigate(`/${href}`);
      } else {
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  // Initial load animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(logoRef.current, {
        y: -30, opacity: 0, duration: 1, ease: "power3.out", delay: 0.2,
      });
      gsap.from(".nav-pill", {
        y: -30, opacity: 0, duration: 1, ease: "power3.out", delay: 0.3,
      });
      gsap.from(".header-cta", {
        y: -30, opacity: 0, duration: 1, ease: "power3.out", delay: 0.4,
      });
    }, headerRef);
    return () => ctx.revert();
  }, []);

  // Scroll listener for compact header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll and animate mobile menu
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      gsap.fromTo(".mobile-link", 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power2.out", delay: 0.1, clearProps: "all" }
      );
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <header 
      ref={headerRef} 
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ease-out ${scrolled ? 'py-4' : 'py-6 md:py-8'}`}
    >
      {/* Optional top gradient fade to ensure text readability */}
      <div className={`absolute inset-0 bg-gradient-to-b from-[#050505]/80 to-transparent pointer-events-none transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`} />

      <div className="container relative mx-auto px-4 sm:px-8 flex justify-between items-center z-10">

        {/* LOGO */}
        <div ref={logoRef} className="flex items-center z-[101]">
          <Link to="/" className="relative group flex items-center">
            <img
              src="/image/logo.webp"
              alt="CREWVIA"
              width={140}
              height={40}
              className="h-8 md:h-10 w-auto object-contain transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            />
          </Link>
        </div>

        {/* DESKTOP NAV PILL */}
        <nav
          className={`nav-pill hidden md:flex items-center gap-8 bg-[#ffffff]/[0.03] hover:bg-[#ffffff]/[0.05] backdrop-blur-xl border border-white/10 px-8 py-3.5 rounded-full shadow-2xl transition-all duration-500 ${scrolled ? 'bg-[#ffffff]/[0.06] border-white/20' : ''}`}
          aria-label="Primary navigation"
        >
          {NAV_LINKS.map((item) => (
            <Link
              key={item.label}
              to={item.href.startsWith("#") ? `/${item.href}` : item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="text-[10px] lg:text-xs uppercase tracking-[0.25em] font-semibold text-white/50 hover:text-white transition-colors duration-300 relative group"
            >
              {item.label}
              {/* Subtle hover dot indicator */}
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#2ec4b6] rounded-full opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0" />
            </Link>
          ))}
        </nav>

        {/* CTA & MOBILE TOGGLE */}
        <div className="header-cta flex items-center gap-4 z-[101]">
          
          {/* Premium Hollow CTA */}
          <Link
            to={CONTACT_LINK.href}
            className="hidden sm:inline-flex relative group items-center justify-center px-7 py-3.5 rounded-full overflow-hidden transition-all duration-500"
          >
            {/* Animated Border Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#2ec4b6] to-[#d4e157] opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
            {/* Inner Dark Background */}
            <div className="absolute inset-[1px] bg-[#050505] rounded-full transition-colors duration-500 group-hover:bg-[#0a0a0a]" />
            {/* Text */}
            <span className="relative z-10 text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors duration-300">
              {CONTACT_LINK.label}
            </span>
          </Link>

          {/* Minimalist Hamburger */}
          <button
            className="md:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <div className={`w-4 h-[1.5px] bg-white transition-all duration-300 origin-center ${mobileOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
            <div className={`w-4 h-[1.5px] bg-white transition-all duration-300 origin-center ${mobileOpen ? "opacity-0 scale-x-0" : ""}`} />
            <div className={`w-4 h-[1.5px] bg-white transition-all duration-300 origin-center ${mobileOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
          </button>
        </div>
      </div>

      {/* MOBILE FULLSCREEN MENU */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed inset-0 bg-[#050505]/95 backdrop-blur-2xl z-[100] flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col gap-8 text-center">
          {[...NAV_LINKS, { href: "/contact", label: "Contact Us" }].map((item, idx) => (
            <Link
              key={item.label}
              to={item.href.startsWith("#") ? `/${item.href}` : item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="mobile-link text-4xl sm:text-5xl font-heading font-black uppercase tracking-tight text-white/40 hover:text-white transition-colors duration-300 relative group"
            >
              {item.label}
              {/* Strike-through effect on hover for mobile */}
              <span className="absolute top-1/2 left-0 w-0 h-1 bg-[#2ec4b6] -translate-y-1/2 transition-all duration-500 ease-out group-hover:w-full mix-blend-screen" />
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
