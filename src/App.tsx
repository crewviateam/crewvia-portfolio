import React, { useEffect, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Lenis from "@studio-freight/lenis";
import { gsap, ScrollTrigger } from "./lib/gsap";
import { initAnalytics } from "./lib/analytics";

import CustomCursor  from "./components/layout/CustomCursor";
import Header        from "./components/layout/Header";
import LeadCapture   from "./components/ui/LeadCapture";

const Home        = React.lazy(() => import("./pages/Home"));
const CaseStudy   = React.lazy(() => import("./pages/CaseStudy"));
const Contact     = React.lazy(() => import("./pages/Contact"));
const Footer      = React.lazy(() => import("./components/layout/Footer"));

export default function App() {
  const tickerFnRef = useRef<((time: number) => void) | null>(null);
  const location = useLocation();

  const lenisRef = useRef<InstanceType<typeof Lenis> | null>(null);

  // Initialize Lenis + analytics ONCE on mount (never re-create on route change)
  useEffect(() => {
    initAnalytics();

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    tickerFnRef.current = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFnRef.current);
    gsap.ticker.lagSmoothing(0);

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;
      
      const href = anchor.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        // If we are on the home page, scroll smoothly
        if (window.location.pathname === "/") {
          e.preventDefault();
          lenis.scrollTo(href, { offset: 0 });
        }
      }
    };
    document.addEventListener("click", handleAnchorClick);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      lenis.destroy();
      lenisRef.current = null;
      if (tickerFnRef.current) {
        gsap.ticker.remove(tickerFnRef.current);
        tickerFnRef.current = null;
      }
    };
  }, []); // Mount-once — stable scroll engine

  // Scroll to top on route change (lightweight, no Lenis re-creation)
  useEffect(() => {
    window.scrollTo(0, 0);
    lenisRef.current?.scrollTo(0, { immediate: true });
    // Refresh ScrollTrigger positions after route change layout shifts
    const timer = setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="w-full min-h-screen bg-[var(--bg-color)] text-[var(--text-color)]">
      <CustomCursor />
      <Header />
      
      <React.Suspense fallback={<div className="h-screen bg-[var(--bg-color)]" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work/:id" element={<CaseStudy />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </React.Suspense>

      <React.Suspense fallback={null}>
        <Footer />
      </React.Suspense>
      
      <LeadCapture />
    </div>
  );
}
