import React from "react";
import { getContent } from "../data/siteContent";
import Hero          from "../components/sections/Hero";
import Metrics       from "../components/sections/Metrics";
import Testimonials  from "../components/sections/Testimonials";

const Intro       = React.lazy(() => import("../components/sections/Intro"));
const WorkGallery = React.lazy(() => import("../components/sections/WorkGallery"));
const Process     = React.lazy(() => import("../components/sections/Process"));
const Manifesto   = React.lazy(() => import("../components/sections/Manifesto"));
const Team        = React.lazy(() => import("../components/sections/Team"));
const Services    = React.lazy(() => import("../components/sections/Services"));
const WaysToWork  = React.lazy(() => import("../components/sections/WaysToWork"));
const Marquee     = React.lazy(() => import("../components/sections/Marquee"));

function isSectionVisible(key: string): boolean {
  const val = getContent(key as any, "true");
  return val !== "false";
}

export default function Home() {
  const show = {
    intro:     isSectionVisible("section_intro_visible"),
    work:      isSectionVisible("section_work_visible"),
    process:   isSectionVisible("section_process_visible"),
    manifesto: isSectionVisible("section_manifesto_visible"),
    team:      isSectionVisible("section_team_visible"),
    services:  isSectionVisible("section_services_visible"),
    marquee:   isSectionVisible("section_marquee_visible"),
  };

  React.useEffect(() => {
    document.title = "CREWVIA — Creative Freedom, United Crew";
  }, []);

  return (
    <main>
      <Hero />
      <React.Suspense fallback={<div className="h-screen bg-[var(--bg-color)]" />}>
        {show.intro     && <Intro />}
        {show.work      && <WorkGallery />}
        <Metrics />
        {show.services  && <Services />}
        <WaysToWork />
        {show.process   && <Process />}
        <Testimonials />
        {show.manifesto && <Manifesto />}
        {show.team      && <Team />}
        {show.marquee   && <Marquee />}
      </React.Suspense>
    </main>
  );
}
