import { useParams, Link, Navigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { projects } from "../data/projects";
import { gsap, ScrollTrigger } from "../lib/gsap";

export default function CaseStudy() {
  const { id } = useParams<{ id: string }>();
  const project = projects.find((p) => p.id === id);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (project) {
      document.title = `${project.title} — CREWVIA Case Study`;
    }
    
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".cs-animate", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.2,
        clearProps: "all" // CRITICAL: Removes transform to allow position: sticky to work
      });

      ScrollTrigger.matchMedia({
        "(min-width: 1024px)": function() {
          const sidebar = document.querySelector(".cs-sidebar") as HTMLElement;
          if (!sidebar) return;

          ScrollTrigger.create({
            trigger: sidebar,
            start: "top 128px", // top-32 offset
            endTrigger: ".cs-content-grid",
            end: () => `bottom ${128 + sidebar.offsetHeight}px`,
            pin: true,
            pinSpacing: false, // Prevents pushing layout down in grid
          });
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, [id, project]);

  if (!project) {
    return <Navigate to="/" replace />;
  }

  return (
    <div ref={containerRef} className="w-full min-h-screen bg-[#050505] text-white pt-32 pb-32 font-sans selection:bg-[#2ec4b6]/30 relative overflow-hidden">
      
      {/* Ambient Background Glows & Noise */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#2ec4b6] opacity-[0.06] blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-[30%] right-[-10%] w-[40vw] h-[40vw] bg-[#d4e157] opacity-[0.04] blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[10%] w-[60vw] h-[60vw] bg-[#3acae4] opacity-[0.04] blur-[150px] rounded-full mix-blend-screen" />
        {/* SVG Noise Texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }} />
      </div>

      {/* Top Navigation */}
      <div className="container relative mx-auto px-4 sm:px-8 max-w-7xl mb-12 cs-animate z-10">
        <Link to="/" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors flex items-center gap-2 w-fit group">
          <span className="transition-transform duration-300 group-hover:-translate-x-1">&larr;</span> Back to Portfolio
        </Link>
      </div>

      <div className="container relative mx-auto px-4 sm:px-8 max-w-7xl z-10">
        {/* HERO SECTION */}
        <div className="max-w-4xl mb-16">
          {/* Top Metadata String */}
          <div className="cs-animate flex flex-wrap items-center gap-3 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-white/60 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2ec4b6]" />
              {project.category}
            </div>
            <span className="opacity-40">•</span>
            <span>{project.year}</span>
            <span className="opacity-40">•</span>
            <span>CREWVIA DESIGN</span>
          </div>

          {/* Massive Headline */}
          <h1 className="cs-animate text-[clamp(2.5rem,5.5vw,5rem)] font-heading font-black leading-[1.05] tracking-tight mb-8">
            {project.title}
          </h1>

          {/* Subtitle / TLDR */}
          <p className="cs-animate text-xl sm:text-2xl md:text-3xl font-serif-italic text-white/80 leading-[1.6] max-w-4xl">
            {project.description || "A comprehensive digital transformation aimed at redefining the brand's core identity and establishing a highly scalable, premium web presence."}
          </p>
        </div>

        {/* FEATURED IMAGE (RESTRICTED HEIGHT) */}
        <div className="cs-animate w-full h-[40vh] md:h-[55vh] max-h-[700px] rounded-2xl md:rounded-[2.5rem] overflow-hidden relative mb-24 md:mb-32 bg-white/5 border border-white/[0.08] shadow-2xl group z-10">
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/60 via-transparent to-transparent z-10 pointer-events-none" />
          <img 
            src={project.image} 
            alt={project.title} 
            className="w-full h-full object-cover object-top transform transition-transform duration-[2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]" 
          />
        </div>

        {/* TWO-COLUMN CONTENT GRID */}
        <div className="cs-content-grid grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 relative items-start">
          
          {/* LEFT SIDEBAR (PINNED) */}
          <div className="lg:col-span-4 z-10">
            <div className="cs-sidebar flex flex-col gap-4 cs-animate w-full">
              {/* Metadata Card 1 */}
              <div className="bg-[#0a0a0a] border border-white/[0.08] p-6 md:p-8 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#d4e157] shadow-[0_0_8px_#d4e157]" />
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">Industry</h3>
                </div>
                <p className="text-lg md:text-xl font-medium text-white">{project.category}</p>
              </div>

              {/* Metadata Card 2 */}
              <div className="bg-[#0a0a0a] border border-white/[0.08] p-6 md:p-8 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#2ec4b6] shadow-[0_0_8px_#2ec4b6]" />
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">Our Role</h3>
                </div>
                <div className="flex flex-wrap gap-2 text-base md:text-lg font-medium text-white/90">
                  {project.tags?.map((tag, i) => (
                    <span key={tag}>
                      {tag}{i < project.tags.length - 1 ? <span className="text-white/30 ml-2">,</span> : ''}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metadata Card 3 */}
              <div className="bg-[#0a0a0a] border border-white/[0.08] p-6 md:p-8 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#3acae4] shadow-[0_0_8px_#3acae4]" />
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">Deliverables</h3>
                </div>
                <p className="text-base md:text-lg font-medium text-white/80 leading-relaxed">
                  Brand Strategy, UI/UX Redesign, Frontend Engineering, Custom GSAP Animations.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT BODY */}
          <div className="lg:col-span-8 flex flex-col gap-24">
            
            {/* Section 01 */}
            <section className="cs-animate">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#2ec4b6]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#2ec4b6]">01</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-sans font-semibold leading-[1.2] tracking-tight mb-8 text-white/95">
                {project.problemStatement || "The problem: a digital presence that couldn't match the brand's ambition."}
              </h2>
              
              <div className="text-lg md:text-2xl font-medium text-white/80 leading-[1.7] space-y-8 mb-16 max-w-3xl">
                {project.problemParagraphs ? (
                  project.problemParagraphs.map((p, i) => <p key={i}>{p}</p>)
                ) : (
                  <>
                    <p>
                      {project.title} had a product genuinely worth paying attention to. The core technology was solid, but the web presence was falling short. Enterprise buyers were landing on the site and couldn't quickly answer the question that matters most: "Is this built for us?"
                    </p>
                    <p>
                      Their entire web presence was acting as a decorative brochure rather than a high-converting sales tool. We needed to strip away the noise and engineer an experience that communicated trust, premium quality, and effortless utility.
                    </p>
                  </>
                )}
              </div>

              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#d4e157] mb-8">
                Specific friction points we identified:
              </h3>

              <div className="flex flex-col gap-6">
                {(project.frictionPoints || [
                  "The core value proposition was buried under dense, unreadable text. Visitors couldn't \"see\" how the platform actually worked without scheduling a demo.",
                  "Zero trust signals. No clear case studies, rigid typography, and a lack of premium micro-interactions made the platform feel outdated to high-ticket enterprise buyers."
                ]).map((point, idx) => {
                  const isTeal = idx % 2 === 0;
                  return (
                    <div key={idx} className={`bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] rounded-3xl p-8 md:p-10 backdrop-blur-md shadow-2xl relative overflow-hidden group transition-all duration-500 ${isTeal ? "hover:border-[#2ec4b6]/50 hover:shadow-[0_0_30px_rgba(46,196,182,0.15)]" : "hover:border-[#d4e157]/50 hover:shadow-[0_0_30px_rgba(212,225,87,0.15)]"}`}>
                      <div className={`absolute inset-0 bg-gradient-to-r ${isTeal ? "from-[#2ec4b6]/10" : "from-[#d4e157]/10"} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      <p className="text-white/90 font-medium leading-[1.7] text-lg md:text-xl relative z-10">
                        {point}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Section 02 */}
            <section className="cs-animate">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#d4e157]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#d4e157]">02</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-sans font-semibold leading-[1.2] tracking-tight mb-8 text-white/95">
                {project.solutionStatement || "The solution: engineering a high-fidelity, scroll-driven storytelling experience."}
              </h2>
              
              <div className="text-lg md:text-2xl font-medium text-white/80 leading-[1.7] space-y-8 max-w-3xl">
                {project.solutionParagraphs ? (
                  project.solutionParagraphs.map((p, i) => <p key={i}>{p}</p>)
                ) : (
                  <>
                    <p>
                      We approached the redesign not just as a visual facelift, but as a structural overhaul of how information is consumed. By implementing custom GSAP ScrollTriggers, we turned static features into a synchronized, interactive journey.
                    </p>
                    <p>
                      The result is a lightning-fast, production-grade application that feels more like premium software than a traditional website. It guides the user effortlessly from curiosity to conversion.
                    </p>
                  </>
                )}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
