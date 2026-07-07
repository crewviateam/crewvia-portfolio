import React, { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import { gsap, ScrollTrigger } from "./lib/gsap";
import { initAnalytics } from "./lib/analytics";
import { getContent } from "./data/siteContent";

import CustomCursor  from "./components/layout/CustomCursor";
import Header        from "./components/layout/Header";
import Hero          from "./components/sections/Hero";
import LeadCapture   from "./components/ui/LeadCapture";

const Intro       = React.lazy(() => import("./components/sections/Intro"));
const WorkGallery = React.lazy(() => import("./components/sections/WorkGallery"));
const Process     = React.lazy(() => import("./components/sections/Process"));
const Manifesto   = React.lazy(() => import("./components/sections/Manifesto"));
const Team        = React.lazy(() => import("./components/sections/Team"));
const Services    = React.lazy(() => import("./components/sections/Services"));
const Marquee     = React.lazy(() => import("./components/sections/Marquee"));
const Footer      = React.lazy(() => import("./components/layout/Footer"));

/** Read a section_X_visible key from siteContent; defaults to visible (true) if key not set */
function isSectionVisible(key: string): boolean {
  // getContent returns "" when key missing from siteContent — treat as visible
  const val = getContent(key as Parameters<typeof getContent>[0], "true");
  return val !== "false";
}

export default function App() {
  const tickerFnRef = useRef<((time: number) => void) | null>(null);

  // Section visibility — evaluated at BUILD TIME from siteContent.json
  // Toggle these from Admin → Sections page → triggers Vercel redeploy
  const show = {
    intro:     isSectionVisible("section_intro_visible"),
    work:      isSectionVisible("section_work_visible"),
    process:   isSectionVisible("section_process_visible"),
    manifesto: isSectionVisible("section_manifesto_visible"),
    team:      isSectionVisible("section_team_visible"),
    services:  isSectionVisible("section_services_visible"),
    marquee:   isSectionVisible("section_marquee_visible"),
  };

  useEffect(() => {
    initAnalytics();

    // 1. Force scroll to top on reload
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenis.on("scroll", ScrollTrigger.update);

    tickerFnRef.current = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFnRef.current);
    gsap.ticker.lagSmoothing(0);

    // 2. Global smooth scroll for anchor links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;
      
      const href = anchor.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        e.preventDefault();
        lenis.scrollTo(href, { offset: 0 });
      }
    };
    document.addEventListener("click", handleAnchorClick);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      lenis.destroy();
      if (tickerFnRef.current) {
        gsap.ticker.remove(tickerFnRef.current);
        tickerFnRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <div className="w-full min-h-screen bg-[var(--bg-color)] text-[var(--text-color)]">
        <CustomCursor />
        <Header />
        <main>
          {/* Hero is always visible — it is not toggleable */}
          <Hero />
          <React.Suspense fallback={<div className="h-screen bg-[var(--bg-color)]" />}>
            {show.intro     && <Intro />}
            {show.work      && <WorkGallery />}
            {show.process   && <Process />}
            {show.manifesto && <Manifesto />}
            {show.team      && <Team />}
            {show.services  && <Services />}
            {show.marquee   && <Marquee />}
          </React.Suspense>
        </main>
        <React.Suspense fallback={null}>
          <Footer />
        </React.Suspense>
        {/* Phase 7: Lead capture slide-in — triggers after 3min or 100% scroll */}
        <LeadCapture />
      </div>
    </>
  );
}
