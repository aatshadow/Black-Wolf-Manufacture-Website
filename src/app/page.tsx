import { Hero } from "@/components/sections/hero";
import { LogoCloud } from "@/components/sections/logo-cloud";
import { RoiImpact } from "@/components/sections/roi-impact";
import { WhatWeDo } from "@/components/sections/what-we-do";
import { ProcessTimeline } from "@/components/sections/process-timeline";
import { Stats } from "@/components/sections/stats";
import { CTA } from "@/components/sections/cta";

export default function Home() {
  return (
    <>
      <div className="flex min-h-[100dvh] flex-col">
        <Hero />
      </div>
      <LogoCloud />
      <RoiImpact />
      <WhatWeDo />
      <ProcessTimeline />
      <Stats />
      <CTA
        title="Ready to digitalize your operations?"
        subtitle="Book a free consultation call and see how BlackWolf can transform your manufacturing business."
        primaryLabel="Book a Call"
        primaryHref="/contact"
        secondaryLabel="See Our Work"
        secondaryHref="/showcase"
      />
    </>
  );
}
