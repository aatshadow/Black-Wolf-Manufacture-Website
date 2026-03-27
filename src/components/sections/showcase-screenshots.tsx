"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { useLang, translations } from "@/lib/i18n";

const screenshots = [
  { src: "/img/showcase-crm.png", alt: "Customized CRM" },
  { src: "/img/showcase-leaderboard.png", alt: "Leaderboard & Rankings" },
  { src: "/img/showcase-bi.png", alt: "Intelligence Platform" },
  { src: "/img/showcase-soc.png", alt: "SOC Security System" },
];

export function ShowcaseScreenshots() {
  const lang = useLang();
  const t = translations.showcase[lang];
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative bg-transparent py-16 md:py-32" ref={ref}>
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 text-center md:mb-16"
        >
          <h2 className="mb-3 text-[clamp(24px,3.5vw,48px)] font-light tracking-[-0.02em] text-white md:mb-4">
            {t.screenshotsTitle}
          </h2>
          <p className="text-sm text-white/50 md:text-base">{t.screenshotsSubtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
          {screenshots.map((screenshot, i) => {
            const alt = t.screenshots[i]?.alt || screenshot.alt;
            return (
            <motion.div
              key={alt}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.4 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.02 }}
              className="group relative aspect-video overflow-hidden rounded-xl border border-white/[0.06] md:rounded-2xl"
            >
              <Image
                src={screenshot.src}
                alt={alt}
                fill
                className="object-cover transition-all duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050510]/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 text-[10px] font-medium text-white/60 md:bottom-4 md:left-4 md:text-xs">
                {alt}
              </div>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
