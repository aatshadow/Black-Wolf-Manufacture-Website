import { HeroSmall } from "@/components/sections/hero-small";
import { BentoServices } from "@/components/sections/bento-services";
import { ProcessTimeline } from "@/components/sections/process-timeline";
import { Pricing } from "@/components/sections/pricing";
import { CTA } from "@/components/sections/cta";

export const metadata = {
  title: "BLACKWOLF — Услуги",
  description: "Пълна дигитална инфраструктура за производствени компании.",
};

export default function ServicesBG() {
  return (
    <>
      <HeroSmall
        badge="Нашите услуги"
        title="Всичко, от което фабриката ви се нуждае, в една система"
        subtitle="Пълна дигитална инфраструктура — от бизнес операции до AI сигурност — внедрена за 5 седмици."
      />
      <BentoServices />
      <ProcessTimeline />
      <Pricing />
      <CTA
        title="Готови да модернизирате операциите си?"
        subtitle="Запазете безплатна консултация и нека проектираме перфектната система за вашия бизнес."
        primaryLabel="Запази среща"
        primaryHref="/bg/contact"
      />
    </>
  );
}
