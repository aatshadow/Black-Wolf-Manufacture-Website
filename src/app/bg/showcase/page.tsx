import { HeroSmall } from "@/components/sections/hero-small";
import { CaseStudies } from "@/components/sections/case-studies";
import { ShowcaseScreenshots } from "@/components/sections/showcase-screenshots";
import { LogoCloud } from "@/components/sections/logo-cloud";
import { CTA } from "@/components/sections/cta";

export const metadata = {
  title: "BLACKWOLF — Портфолио",
  description: "Реални резултати от реални бизнеси.",
};

export default function ShowcaseBG() {
  return (
    <>
      <HeroSmall
        badge="Нашата работа"
        title="Реални резултати за реални бизнеси"
        subtitle="Вижте как трансформирахме операциите на производители и дигитални бизнеси в Европа."
      />
      <CaseStudies />
      <ShowcaseScreenshots />
      <LogoCloud />
      <CTA
        title="Искате подобни резултати?"
        subtitle="Запазете безплатна консултация и нека обсъдим вашата трансформация."
        primaryLabel="Запази среща"
        primaryHref="/bg/contact"
        secondaryLabel="Разгледай услугите"
        secondaryHref="/bg/services"
      />
    </>
  );
}
