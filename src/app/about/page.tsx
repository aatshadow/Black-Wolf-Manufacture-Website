import { HeroSmall } from "@/components/sections/hero-small";
import { AboutStory } from "@/components/sections/about-story";
import { TeamSection } from "@/components/sections/team-section";
import { WhyBlackwolf } from "@/components/sections/why-blackwolf";
import { CTA } from "@/components/sections/cta";

export const metadata = {
  title: "BLACKWOLF — About",
  description: "BlackWolf builds complete digital infrastructure for manufacturing companies. One team, one system, one mission.",
};

export default function AboutPage() {
  return (
    <>
      <HeroSmall
        badge="About Us"
        title="We exist to modernize manufacturing."
        subtitle="BlackWolf was founded with one mission: give manufacturing companies the same digital infrastructure that tech companies take for granted."
      />
      <AboutStory />
      <TeamSection />
      <WhyBlackwolf />
      <CTA
        title="Want to work with us?"
        subtitle="Let's discuss how we can transform your manufacturing operations."
        primaryLabel="Get in Touch"
        primaryHref="/contact"
      />
    </>
  );
}
