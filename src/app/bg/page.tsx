import { Hero } from "@/components/sections/hero";
import { LogoCloud } from "@/components/sections/logo-cloud";
import { RoiImpact } from "@/components/sections/roi-impact";
import { WhatWeDo } from "@/components/sections/what-we-do";
import { ProcessTimeline } from "@/components/sections/process-timeline";
import { Stats } from "@/components/sections/stats";
import { CTA } from "@/components/sections/cta";

export const metadata = {
  title: "BLACKWOLF — Дигитална инфраструктура за производство",
  description: "Цялостна дигитална инфраструктура за производствени компании. Операции, сигурност и интелигентност — внедрени за 5 седмици.",
};

export default function HomeBG() {
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
        title="Готови ли сте да дигитализирате операциите си?"
        subtitle="Запазете безплатна консултация и вижте как BlackWolf може да трансформира вашия производствен бизнес."
        primaryLabel="Запази среща"
        primaryHref="/bg/contact"
        secondaryLabel="Виж нашата работа"
        secondaryHref="/bg/showcase"
      />
    </>
  );
}
