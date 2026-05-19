/**
 * src/components/sections/Marquee.tsx
 */
import React, { useEffect, useRef } from "react";
import { gsap } from "../../lib/gsap";

const items = [
  { text: "Branding",   outline: true  },
  { text: "Direction",  outline: false },
  { text: "Film",       outline: true  },
  { text: "Web",        outline: false },
  { text: "Marketing",  outline: true  },
  { text: "Identity",   outline: false },
];

export default function Marquee() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".marquee-inner", {
        xPercent: -50,
        repeat: -1,
        duration: 22,
        ease: "linear",
      });
    }, marqueeRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={marqueeRef}
      className="py-12 md:py-20 overflow-hidden bg-[#050505]"
      style={{ borderTop: "1px solid rgba(46,196,182,0.1)", borderBottom: "1px solid rgba(212,225,87,0.1)" }}
    >
      <div className="marquee-inner flex whitespace-nowrap w-fit">
        {[...Array(3)].map((_, repeat) => (
          <div key={repeat} className="flex items-center gap-12 px-6">
            {items.map((item, i) => (
              <React.Fragment key={i}>
                <span
                  className="text-[8vw] font-heading font-bold uppercase leading-none transition-colors duration-500 cursor-default"
                  style={
                    item.outline
                      ? { WebkitTextStroke: "1.5px rgba(46,196,182,0.4)", color: "transparent" }
                      : { color: "#f4f4f4" }
                  }
                >
                  {item.text}
                </span>
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: i % 2 === 0 ? "#2ec4b6" : "#d4e157" }}
                />
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
