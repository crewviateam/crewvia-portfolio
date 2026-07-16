import { useEffect, useRef } from "react";
import { gsap } from "../../lib/gsap";
import { trackCta, CtaName } from "../../lib/analytics";

interface MagneticButtonProps {
  href: string;
  id?: string;
  text: string;
  cursorText?: string;
  ctaName?: CtaName;
  className?: string;
}

export default function MagneticButton({
  href,
  id,
  text,
  cursorText = "VIEW",
  ctaName,
  className = "",
}: MagneticButtonProps) {
  const hitAreaRef = useRef<HTMLAnchorElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!hitAreaRef.current || !visualRef.current || !textRef.current) return;
    
    // Only activate magnetic effect on devices with fine pointer (mouse)
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const hitArea = hitAreaRef.current;
    const visual = visualRef.current;
    const textSpan = textRef.current;

    const xTo = gsap.quickTo(visual, "x", { duration: 0.4, ease: "power3.out" });
    const yTo = gsap.quickTo(visual, "y", { duration: 0.4, ease: "power3.out" });
    const textXTo = gsap.quickTo(textSpan, "x", { duration: 0.3, ease: "power3.out" });
    const textYTo = gsap.quickTo(textSpan, "y", { duration: 0.3, ease: "power3.out" });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = hitArea.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      
      xTo(x * 0.4);
      yTo(y * 0.4);
      textXTo(x * 0.15);
      textYTo(y * 0.15);
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
      textXTo(0);
      textYTo(0);
      gsap.to(visual, { background: "transparent", color: "#2ec4b6", duration: 0.3 });
    };

    const handleMouseEnter = () => {
      gsap.to(visual, { background: "#2ec4b6", color: "#050505", duration: 0.3 });
    };

    hitArea.addEventListener("mousemove", handleMouseMove);
    hitArea.addEventListener("mouseleave", handleMouseLeave);
    hitArea.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      hitArea.removeEventListener("mousemove", handleMouseMove);
      hitArea.removeEventListener("mouseleave", handleMouseLeave);
      hitArea.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  return (
    <a
      ref={hitAreaRef}
      href={href}
      id={id}
      data-cursor-text={cursorText}
      className={`inline-block p-6 -m-6 cursor-pointer ${className}`}
      onClick={() => ctaName && trackCta(ctaName)}
    >
      <div
        ref={visualRef}
        className="inline-flex px-6 md:px-8 py-3 md:py-4 rounded-full uppercase text-[10px] md:text-xs tracking-[0.2em] font-semibold relative pointer-events-none"
        style={{ border: "1.5px solid #2ec4b6", color: "#2ec4b6", transformStyle: "preserve-3d" }}
      >
        <span ref={textRef} className="relative z-10 block inline-block">{text}</span>
      </div>
    </a>
  );
}
