import { HeroSmall } from "@/components/sections/hero-small";
import { BentoServices } from "@/components/sections/bento-services";
import { ProcessTimeline } from "@/components/sections/process-timeline";
import { Pricing } from "@/components/sections/pricing";
import { CTA } from "@/components/sections/cta";

export const metadata = {
  title: "BLACKWOLF — Services",
  description: "Complete digital infrastructure for manufacturing: CRM, ERP, BI, cybersecurity, and AI automation — delivered in 5 weeks.",
};

export default function ServicesPage() {
  return (
    <>
      <HeroSmall
        badge="Our Services"
        title="Everything your factory needs. One provider."
        subtitle="We deliver a complete digital infrastructure — from operations management to cybersecurity — in a single, integrated package."
      />
      <BentoServices />
      <ProcessTimeline />
      <Pricing />
      <CTA
        title="Not sure which plan fits?"
        subtitle="Book a free consultation and we'll design the right solution for your business."
      />
    </>
  );
}
