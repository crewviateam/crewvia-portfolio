"use client";

/**
 * Process.tsx — drop-in replacement.
 *
 * FIX vs original:
 * ❌ max-height transition for accordion   → ✅ grid-rows: 0fr / 1fr transition.
 *    max-height: 0 → max-height: 300px        max-height triggers a layout
 *    forces the browser to recalculate         recalculation (reflow) on every
 *    layout on every animation frame           animation frame because the browser
 *    because it doesn't know the final         must measure content height each
 *    height until it's painted.               tick. grid-rows goes from 0fr to 1fr
 *                                              which the browser can interpolate
 *                                              without a reflow — transform-class
 *                                              cost only.
 *
 *    The inner wrapper needs min-height:0
 *    to collapse correctly in grid context.
 */

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "../lib/gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Plus, Minus } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    num: "01",
    title: "Discovery",
    desc: "We don't start with solutions. We start with questions. We deconstruct your brand to its atomic level, understanding the chaos before we implement the order.",
  },
  {
    num: "02",
    title: "Strategy",
    desc: "Chaos needs a container. We build the strategic framework that will hold the vision. Positioning, voice, and visual direction are defined here.",
  },
  {
    num: "03",
    title: "Execution",
    desc: "Where the rubber meets the road. We deploy high-fidelity design, motion, and code. No templates. No shortcuts. Just pure craftsmanship.",
  },
  {
    num: "04",
    title: "Launch",
    desc: "The reveal. We manage the deployment, ensure performance across the globe, and hand over the keys to your new digital empire.",
  },
];

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".process-title", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section-padding text-white" style={{ background: "#0a0a0a" }}>
      <div className="container">
        <div className="flex flex-col md:flex-row mb-24 justify-between items-start md:items-end">
          <h2 className="text-[10vw] md:text-[8vw] leading-[0.8] tracking-tighter process-title">
            THE<br />PROCESS
          </h2>
          <p className="max-w-md text-lg mt-8 md:mt-0 font-medium opacity-70">
            Our methodology is a blend of rigorous strategy and unbridled creativity.
          </p>
        </div>

        <div className="border-t border-white/10">
          {steps.map((step, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border-b border-white/10 cursor-pointer group"
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <div className="py-8 md:py-12 flex justify-between items-center pr-4">
                  <div className="flex items-baseline gap-8 md:gap-16">
                    <span className="font-mono text-sm md:text-base" style={{ color: "#2ec4b6", opacity: 0.9 }}>
                      ({step.num})
                    </span>
                    <h3 className="text-3xl md:text-6xl font-normal group-hover:translate-x-4 transition-transform duration-500 font-serif-italic">
                      {step.title}
                    </h3>
                  </div>
                  <div className="relative w-6 h-6">
                    <div className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 ${isOpen ? "rotate-180" : "rotate-0"}`}>
                      {isOpen ? <Minus className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                    </div>
                  </div>
                </div>

                {/*
                 * grid-rows transition: 0fr → 1fr
                 * The browser interpolates the fraction without measuring content
                 * height — no reflow per frame, unlike max-height transitions.
                 * The inner div needs min-height: 0 so it can collapse to 0 inside
                 * a 0fr grid row (without it the content bleeds through).
                 */}
                <div
                  className="grid transition-[grid-template-rows] duration-700 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden" style={{ minHeight: 0 }}>
                    <div className="pb-12 pl-0 md:pl-[120px] max-w-2xl">
                      <p className="text-xl md:text-2xl leading-relaxed font-light opacity-60">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}