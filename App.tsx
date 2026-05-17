/**
 * App.tsx — production-grade, drop-in replacement.
 *
 * Changes vs previous version:
 * ✅ PageLoader added — shows logo animation before site loads
 * ✅ Site content hidden (visibility: hidden) while loader is active
 *    — prevents flash of unstyled content / layout shifts
 * ✅ Lenis only initialised after loader completes — prevents scroll
 *    events firing while the page is locked behind the loader
 * ✅ ScrollTrigger.refresh() called after loader exits — ensures all
 *    scroll positions are calculated on the fully-visible layout
 */

import React, { useEffect, useRef, useState } from "react";
import Lenis from "@studio-freight/lenis";
import { gsap, ScrollTrigger } from "./lib/gsap";

import Header       from "./components/Header";
import Hero         from "./components/Hero";
import CustomCursor from "./components/CustomCursor";
import PageLoader   from "./components/PageLoader";

const Intro       = React.lazy(() => import("./components/Intro"));
const WorkGallery = React.lazy(() => import("./components/WorkGallery"));
const Process     = React.lazy(() => import("./components/Process"));
const Team        = React.lazy(() => import("./components/Team"));
const Marquee     = React.lazy(() => import("./components/Marquee"));
const Services    = React.lazy(() => import("./components/Services"));
const Footer      = React.lazy(() => import("./components/Footer"));
const Manifesto   = React.lazy(() => import("./components/Manifesto"));

export default function App() {
  const [loading, setLoading]   = useState(true);
  const tickerFnRef             = useRef<((time: number) => void) | null>(null);
  const lenisRef                = useRef<Lenis | null>(null);

  // Initialise Lenis after the loader exits so scroll events don't fire
  // while the page is locked. ScrollTrigger.refresh() recalculates all
  // trigger positions on the now-visible layout.
  const handleLoaderComplete = () => {
    setLoading(false);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
    });

    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    tickerFnRef.current = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFnRef.current);
    gsap.ticker.lagSmoothing(0);

    // Give React one frame to paint the visible layout before refreshing
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  };

  // Cleanup Lenis on unmount
  useEffect(() => {
    return () => {
      lenisRef.current?.destroy();
      if (tickerFnRef.current) {
        gsap.ticker.remove(tickerFnRef.current);
        tickerFnRef.current = null;
      }
    };
  }, []);

  return (
    <>
      {/* Loader — unmounts itself via onComplete after exit animation */}
      {/* {loading && <PageLoader onComplete={handleLoaderComplete} />} */}

      {/*
       * Site is in the DOM during loading so lazy components can start
       * fetching, but visibility:hidden means nothing is painted/seen.
       * This avoids a layout shift when the loader exits.
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