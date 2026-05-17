/**
 * App.tsx — drop-in replacement.
 *
 * FIXES vs original:
 * ❌ gsap.ticker.remove(lenis.raf)         → ✅ Store the ticker function in a ref
 *    The cleanup passed lenis.raf directly     so the exact same reference is
 *    but gsap.ticker.add() wraps it in a       removed. Without this the original
 *    new function internally — so              listener was never actually removed,
 *    .remove(lenis.raf) never matched,         leaking on every hot reload / unmount.
 *    leaving a zombie ticker running
 *    after unmount / HMR reload.
 *
 * ❌ <div className="noise-overlay" />     → ✅ Removed. This div was always
 *    always mounted in DOM                     mounted, always painted, and the
 *                                              noise-overlay class (presumably a
 *                                              CSS background-image with a data-URI
 *                                              noise texture + mix-blend-mode) was
 *                                              active on every single frame site-wide.
 *                                              If you want grain, scope it to the
 *                                              specific sections that need it rather
 *                                              than the entire app shell.
 *
 * ❌ Lenis smoothTouch: false but          → ✅ Kept smoothTouch: false (correct —
 *    touchMultiplier: 2 is contradictory       native touch scroll is smoother on
 *                                              mobile). Removed touchMultiplier
 *                                              since it has no effect when smoothTouch
 *                                              is false.
 */

import React, { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import { gsap, ScrollTrigger } from "./lib/gsap";

import Header      from "./components/Header";
import Hero        from "./components/Hero";
import CustomCursor from "./components/CustomCursor";

const Intro        = React.lazy(() => import("./components/Intro"));
const WorkGallery  = React.lazy(() => import("./components/WorkGallery"));
const Process      = React.lazy(() => import("./components/Process"));
const Team         = React.lazy(() => import("./components/Team"));
const Marquee      = React.lazy(() => import("./components/Marquee"));
const Services     = React.lazy(() => import("./components/Services"));
const Footer       = React.lazy(() => import("./components/Footer"));
const Manifesto    = React.lazy(() => import("./components/Manifesto"));

export default function App() {
  // Store the ticker fn ref so cleanup removes the exact same reference
  const tickerFnRef = useRef<((time: number) => void) | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      // touchMultiplier removed — has no effect when smoothTouch: false
    });

    lenis.on("scroll", ScrollTrigger.update);

    // Store the wrapper fn so we can remove it precisely later
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
    <div className="w-full min-h-screen bg-[var(--bg-color)] text-[var(--text-color)]">
      {/*
       * noise-overlay removed from app shell.
       * If you need grain on specific sections, add it there scoped to that
       * section's container — not here as a full-page permanent layer.
       */}
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
  );
}