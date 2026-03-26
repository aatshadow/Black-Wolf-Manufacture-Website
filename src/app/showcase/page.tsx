import { HeroSmall } from "@/components/sections/hero-small";
import { CaseStudies } from "@/components/sections/case-studies";
import { LogoCloud } from "@/components/sections/logo-cloud";
import { CTA } from "@/components/sections/cta";
import { ShowcaseScreenshots } from "@/components/sections/showcase-screenshots";

export const metadata = {
  title: "BLACKWOLF — Showcase",
  description: "See the BlackWolf platform in action. Real dashboards, real security systems, built for real manufacturing operations.",
};

export default function ShowcasePage() {
  return (
    <>
      <HeroSmall
        badge="Our Work"
        title="Built for real businesses. Proven in production."
        subtitle="See our platform in action — real dashboards, real security systems, built for real manufacturing operations."
      />
      <CaseStudies />
      <ShowcaseScreenshots />
      <LogoCloud />
      <CTA
        title="Ready to see what we can build for you?"
        subtitle="Book a consultation and explore how we can transform your operations."
        primaryLabel="Book a Call"
        primaryHref="/contact"
        secondaryLabel="Contact Us"
        secondaryHref="/contact"
      />
    </>
  );
}
