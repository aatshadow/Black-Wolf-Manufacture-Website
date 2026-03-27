"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useLang, translations } from "@/lib/i18n";

export function ProcessTimeline() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const lang = useLang();
  const t = translations.timeline[lang];

  return (
    <section className="relative bg-transparent py-16 md:py-32" ref={ref}>
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 text-center md:mb-16"
        >
          <h2 className="mb-3 text-[clamp(24px,3.5vw,48px)] font-light tracking-[-0.02em] text-white md:mb-4">
            {t.title}
          </h2>
          <p className="text-sm text-white/40 md:text-base">{t.subtitle}</p>
        </motion.div>

        <div className="flex flex-col gap-6 md:flex-row md:gap-0">
          {t.steps.map((step, i) => {
            const number = String(i + 1);
            return (
              <motion.div
                key={number}
                initial={{ opacity: 0, y: 25 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.5 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="group relative flex flex-1 items-start gap-4 px-0 py-0 md:flex-col md:items-center md:px-4 md:py-6"
              >
                {i < t.steps.length - 1 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={isInView ? { scaleX: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.8 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 top-[52px] hidden h-[1px] w-full origin-left bg-gradient-to-r from-white/10 to-white/[0.03] md:block"
                  />
                )}

                <div className="flex flex-col items-center gap-1 md:gap-0">
                  <span className="text-[9px] font-bold tracking-[0.3em] text-blue-500/60 md:mb-3 md:text-[10px]">{step.week}</span>
                  <motion.div
                    whileHover={{ scale: 1.1, borderColor: "rgba(37,99,235,0.4)" }}
                    transition={{ duration: 0.3 }}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-base font-bold text-white transition-all group-hover:bg-blue-600/10 md:mb-4 md:h-12 md:w-12 md:text-lg"
                  >
                    {number}
                  </motion.div>
                </div>

                <div className="flex-1 pt-1 md:pt-0 md:text-center">
                  <h4 className="mb-1 text-sm font-bold text-white">{step.label}</h4>
                  <p className="text-xs leading-relaxed text-white/50">{step.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
