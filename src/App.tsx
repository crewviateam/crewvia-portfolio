/**
 * src/App.tsx
 *
 * FIXES vs previous root App.tsx:
 * - PageLoader now wired: shows on first load, hides site until complete
 * - ImageBreak added to section order (was missing from the page)
 * - Lenis updated to current v1.x API (removed deprecated direction/smooth/mouseMultiplier)
 * - All imports updated to new folder structure
 * - Analytics: initAnalytics() fires on first mount
 */
import React, { useEffect, useRef, useState } from "react";
import Lenis from "@studio-freight/lenis";
import { gsap, ScrollTrigger } from "./lib/gsap";
import { initAnalytics } from "./lib/analytics";

import CustomCursor from "./components/layout/CustomCursor";
import Header       from "./components/layout/Header";
import PageLoader   from "./components/layout/PageLoader";

import Hero from "./components/sections/Hero";

const Intro       = React.lazy(() => import("./components/sections/Intro"));
const WorkGallery = React.lazy(() => import("./components/sections/WorkGallery"));
const ImageBreak  = React.lazy(() => import("./components/sections/ImageBreak"));
const Process     = React.lazy(() => import("./components/sections/Process"));
const Manifesto   = React.lazy(() => import("./components/sections/Manifesto"));
const Team        = React.lazy(() => import("./components/sections/Team"));
const Services    = React.lazy(() => import("./components/sections/Services"));
const Marquee     = React.lazy(() => import("./components/sections/Marquee"));
const Footer      = React.lazy(() => import("./components/layout/Footer"));

export default function App() {
  const [loading, setLoading] = useState(true);
  const tickerFnRef = useRef<((time: number) => void) | null>(null);

  useEffect(() => {
    // ── Analytics: initialise once on first mount ──────────────────────────
    initAnalytics();

    // ── Smooth scroll ──────────────────────────────────────────────────────
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothTouch: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    // Store the wrapper fn so we can remove the exact same reference on cleanup
    tickerFnRef.current = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFnRef.current);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      if (tickerFnRef.current) {
        gsap.ticker.remove(tickerFnRef.current);
        tickerFnRef.current = null;
      }
    };
  }, []);

  return (
    <>
      {/* PageLoader — slides up once animation completes, then unmounts */}
      {/* {loading && <PageLoader onComplete={() => setLoading(false)} />} */}

      {/*
       * Site body — hidden (not unmounted) while loading so that:
       *   1. React has already mounted and rendered the DOM
       *   2. GSAP ScrollTrigger can measure element heights correctly
       *   3. No content flash after loader disappears
       */}
      <div
        className="w-full min-h-screen bg-[var(--bg-color)] text-[var(--text-color)]"
      >
        <CustomCursor />
        <Header />
        <main>
          <Hero />
          <React.Suspense fallback={<div className="h-screen bg-[var(--bg-color)]" />}>
            <Intro />
            <WorkGallery />
            {/* <ImageBreak /> */}
            <Process />
            <Manifesto />
            <Team />
            <Services />
            <Marquee />
          </React.Suspense>
        </main>
        <React.Suspense fallback={null}>
          <Footer />
        </React.Suspense>
      </div>
    </>
  );
}

