import { useEffect, useRef } from "react";
import { gsap } from "../../lib/gsap";
import MagneticButton from "../ui/MagneticButton";

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const testimonials = [
    {
      quote: "I had the opportunity to work with CREWVIA on numerous projects for US-based clients. They're a talented team with a great eye for design and strong technical skills. They always brought creative ideas, stayed proactive, and made collaboration effortless. Reliable, skilled, and always delivering great results.",
      author: "Abdul Rehman",
      role: "Senior WordPress Developer"
    },
    {
      quote: "CREWVIA's expertise made a huge difference in our project's success. They quickly understood the requirements, offered valuable insights, and handled every task with precision. I'm very impressed with their skills and communication — I fully intend to work with them again on future projects. Highly recommended.",
      author: "Travis Bunn",
      role: "WordPress & SEO Expert"
    },
    {
      quote: "Working with CREWVIA has been an excellent experience. Great skills, great communication, 10/10. They understand the vision and bring it to life with remarkable precision. Truly a great team to partner with.",
      author: "Sebastian Bimbi",
      role: "Founder, Bimbi | Webflow MVP '25"
    }
  ];

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".testimonial-item", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          once: true,
        },
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power3.out"
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="testimonials" className="section-padding w-full bg-[#050505] border-t border-white/5 relative overflow-hidden">
      
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none mix-blend-screen opacity-20 z-0">
        <div className="ambient-orb ambient-orb-teal absolute top-[10%] left-[20%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px]"></div>
      </div>

      <div className="container relative z-10">
        {/* Standardized Section Header */}
        <div className="section-header testimonial-item">
          <h2 className="section-title">
            CLIENT<br /><span className="stroke-text">LOVE</span>
          </h2>
          <div className="section-meta">
            <span className="section-label">Testimonials</span>
            <p className="section-desc">
              Don't just take our word for it. See what our partners have to say about the work we've accomplished together.
            </p>
          </div>
        </div>

        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 sm:gap-6 pb-8 sm:pb-12 hide-scrollbar"
        >
          {testimonials.map((t, i) => (
            <div 
              key={i} 
              className="testimonial-item glass-card group min-w-[80vw] sm:min-w-[360px] md:min-w-[400px] max-w-[500px] snap-center flex flex-col justify-between"
            >
              <div className="mb-8 sm:mb-12">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#d4e157] opacity-50 mb-4 sm:mb-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                </svg>
                <p className="text-base sm:text-lg md:text-xl font-serif-italic leading-relaxed opacity-90">
                  "{t.quote}"
                </p>
              </div>
              
              <div>
                <div className="font-bold uppercase tracking-wider text-xs sm:text-sm mb-1">{t.author}</div>
                <div className="text-[10px] sm:text-xs font-mono tracking-widest opacity-40">{t.role}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 sm:mt-24 flex justify-center testimonial-item">
          <MagneticButton href="/contact" text="Let's Talk" cursorText="START" />
        </div>
      </div>
    </section>
  );
}
