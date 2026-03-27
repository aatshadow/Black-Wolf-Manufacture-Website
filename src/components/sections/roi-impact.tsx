"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { useLang, translations, localePath } from "@/lib/i18n";

export function RoiImpact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const lang = useLang();
  const t = translations.roi[lang];

  return (
    <section className="relative bg-transparent py-16 md:py-32" ref={ref}>
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 text-center md:mb-16"
        >
          <p className="mb-3 text-[10px] font-medium tracking-[0.3em] text-red-400/50 md:text-xs">
            {t.tag}
          </p>
          <h2 className="mb-4 text-[clamp(24px,3.5vw,48px)] font-light tracking-[-0.02em] text-white md:mb-5">
            {t.title}
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-white/40 md:text-base">
            {t.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {/* Cost of inaction */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-red-500/10 bg-red-600/[0.03] p-5 md:p-8"
          >
            <h3 className="mb-4 text-xs font-bold tracking-[0.2em] text-red-400/60 md:mb-6">
              {t.withoutTitle}
            </h3>
            <div className="space-y-3 md:space-y-4">
              {t.costs.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                  className="flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500/50" />
                    <span className="text-xs text-white/40 md:text-sm">{item.label}</span>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-red-400/70 md:text-sm">{item.value}</span>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1.2 }}
              className="mt-5 border-t border-red-500/10 pt-4 md:mt-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-400/50">{t.monthlyLoss}</span>
                <span className="text-lg font-light text-red-400 md:text-xl">{t.monthlyLossValue}</span>
              </div>
            </motion.div>
          </motion.div>

          {/* With BlackWolf */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-blue-500/10 bg-blue-600/[0.03] p-5 md:p-8"
          >
            <h3 className="mb-4 text-xs font-bold tracking-[0.2em] text-blue-400/60 md:mb-6">
              {t.withTitle}
            </h3>
            <div className="space-y-3 md:space-y-4">
              {t.gains.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                  className="flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500/50" />
                    <span className="text-xs text-white/50 md:text-sm">{item.label}</span>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-blue-400/70 md:text-sm">{item.value}</span>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1.4 }}
              className="mt-5 border-t border-blue-500/10 pt-4 md:mt-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400/50">{t.deployedIn}</span>
                <span className="text-lg font-light text-blue-400 md:text-xl">{t.deployedInValue}</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="mt-10 text-center md:mt-14"
        >
          <p className="mb-5 text-sm text-white/45 md:mb-6 md:text-base">
            {t.bottomText}{" "}
            <span className="text-red-400/70">{t.bottomHighlight}</span>.
          </p>
          <Link href={localePath("/contact", lang)}>
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(37,99,235,0.25)" }}
              whileTap={{ scale: 0.97 }}
              className="rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
            >
              {t.bottomCta}
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
