import { useEffect, useRef, useState } from "react";
import { gsap } from "../lib/gsap";
import { submitContactInquiry } from "../lib/api";

export default function Contact() {
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Contact — CREWVIA";
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".contact-fade-up", {
        y: 60,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.2,
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    
    setIsSubmitting(true);
    setErrorMsg("");
    
    const formData = new FormData(formRef.current);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
    };

    const res = await submitContactInquiry(data);
    
    setIsSubmitting(false);
    
    if (res.success) {
      setIsSuccess(true);
      formRef.current.reset();
    } else {
      setErrorMsg(res.error || "Something went wrong.");
    }
  };

  // Helper to dim other fields when one is focused
  const getOpacityClass = (fieldName: string) => {
    if (!focusedField) return "opacity-100";
    return focusedField === fieldName ? "opacity-100" : "opacity-30";
  };

  return (
    <div ref={containerRef} className="w-full min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pt-28 sm:pt-32 md:pt-40 pb-20 md:pb-32 flex items-center selection:bg-[#2ec4b6]/30">
      <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8">
          
          {/* Left Column: Huge Statement */}
          <div className="lg:col-span-5 flex flex-col justify-start pt-4">
            <h1 className="contact-fade-up text-[clamp(3rem,10vw,7rem)] font-black leading-[0.9] tracking-tighter mb-6 sm:mb-8">
              Hello.<br />
              <span className="text-[#2ec4b6] font-serif-italic opacity-90">Ready?</span>
            </h1>
            <p className="contact-fade-up text-base sm:text-lg md:text-xl leading-relaxed opacity-70 mb-8 sm:mb-12 max-w-sm font-light">
              Drop us a line and tell us about your next big idea. We're currently accepting new projects.
            </p>
            
            <div className="contact-fade-up flex flex-col gap-2">
              <span className="text-xs font-mono uppercase tracking-[0.2em] opacity-40">Direct</span>
              <a href="mailto:hello@crewvia.in" className="text-xl sm:text-2xl font-medium hover:text-[#2ec4b6] transition-colors w-fit relative group">
                hello@crewvia.in
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#2ec4b6] transition-all duration-300 group-hover:w-full"></span>
              </a>
            </div>
          </div>

          {/* Right Column: Minimalist Form */}
          <div className="lg:col-span-7 lg:pl-12">
            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-8 sm:gap-12 md:gap-16">
              
              {isSuccess ? (
                <div className="contact-fade-up flex flex-col items-start gap-6 py-20">
                  <div className="w-16 h-16 rounded-full bg-[#2ec4b6]/20 flex items-center justify-center text-[#2ec4b6]">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-4xl font-bold">Message Received</h3>
                  <p className="text-xl opacity-70 max-w-md font-light">Thank you for reaching out. A member of our crew will be in touch with you shortly.</p>
                  <button type="button" onClick={() => setIsSuccess(false)} className="mt-8 text-sm font-mono uppercase tracking-widest border-b border-white/30 hover:border-[#2ec4b6] hover:text-[#2ec4b6] pb-1 transition-all">Send another</button>
                </div>
              ) : (
                <>
                  <div className="contact-fade-up">
                    <div className={`flex flex-col gap-2 transition-opacity duration-500 ${getOpacityClass("name")}`}>
                      <label htmlFor="name" className="text-sm font-mono uppercase tracking-[0.2em] opacity-60">My name is</label>
                      <input 
                        type="text" 
                        id="name"
                        name="name" 
                        required
                        onFocus={() => setFocusedField("name")}
                        onBlur={() => setFocusedField(null)}
                        className="bg-transparent border-b-2 border-white/20 px-0 py-3 sm:py-4 text-2xl sm:text-3xl md:text-5xl font-light focus:outline-none focus:border-[#2ec4b6] transition-colors placeholder:text-white/10"
                        placeholder="Jane Doe"
                      />
                    </div>
                  </div>

                  <div className="contact-fade-up">
                    <div className={`flex flex-col gap-2 transition-opacity duration-500 ${getOpacityClass("email")}`}>
                      <label htmlFor="email" className="text-sm font-mono uppercase tracking-[0.2em] opacity-60">You can reach me at</label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email"
                        required
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        className="bg-transparent border-b-2 border-white/20 px-0 py-3 sm:py-4 text-2xl sm:text-3xl md:text-5xl font-light focus:outline-none focus:border-[#2ec4b6] transition-colors placeholder:text-white/10"
                        placeholder="jane@example.com"
                      />
                    </div>
                  </div>

                  <div className="contact-fade-up">
                    <div className={`flex flex-col gap-2 transition-opacity duration-500 ${getOpacityClass("message")}`}>
                      <label htmlFor="message" className="text-sm font-mono uppercase tracking-[0.2em] opacity-60">I'm reaching out because</label>
                      <textarea 
                        id="message" 
                        name="message"
                        required
                        rows={1}
                        onFocus={() => setFocusedField("message")}
                        onBlur={() => setFocusedField(null)}
                        className="bg-transparent border-b-2 border-white/20 px-0 py-3 sm:py-4 text-2xl sm:text-3xl md:text-5xl font-light focus:outline-none focus:border-[#2ec4b6] transition-colors resize-y min-h-[80px] sm:min-h-[120px] placeholder:text-white/10"
                        placeholder="We need a new..."
                      ></textarea>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="contact-fade-up text-red-400 text-sm font-mono">{errorMsg}</div>
                  )}

                  <div className="contact-fade-up pt-8">
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="group relative overflow-hidden inline-flex items-center justify-center rounded-full bg-[#2ec4b6] text-black px-10 py-5 text-sm font-bold uppercase tracking-[0.2em] transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        {isSubmitting ? "Sending..." : "Send Message"}
                        {!isSubmitting && (
                          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        )}
                      </span>
                      <div className="absolute inset-0 h-full w-full bg-white/20 translate-y-full transition-transform duration-300 group-hover:translate-y-0 ease-out"></div>
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
