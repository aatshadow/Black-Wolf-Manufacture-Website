import { HeroSmall } from "@/components/sections/hero-small";
import { AboutStory } from "@/components/sections/about-story";
import { TeamSection } from "@/components/sections/team-section";
import { WhyBlackwolf } from "@/components/sections/why-blackwolf";
import { CTA } from "@/components/sections/cta";

export const metadata = {
  title: "BLACKWOLF — За нас",
  description: "Екипът зад дигиталната инфраструктура за производство.",
};

export default function AboutBG() {
  return (
    <>
      <HeroSmall
        badge="За нас"
        title="Екипът зад инфраструктурата"
        subtitle="Ние сме екип от инженери, стратези и оператори, изграждащи дигиталния гръбнак на европейските производители."
      />
      <AboutStory />
      <TeamSection />
      <WhyBlackwolf />
      <CTA
        title="Готови ли сте да работите с нас?"
        subtitle="Нека обсъдим как BlackWolf може да трансформира вашите операции."
        primaryLabel="Запази среща"
        primaryHref="/bg/contact"
      />
    </>
  );
}
