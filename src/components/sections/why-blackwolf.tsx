"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Layers, Zap, Factory, Brain } from "lucide-react";
import { useLang, translations } from "@/lib/i18n";

const reasonIcons = [Layers, Zap, Factory, Brain];

export function WhyBlackwolf() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const lang = useLang();
  const t = translations.whyBw[lang];

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
            {t.title}
          </h2>
          <p className="text-sm text-white/50 md:text-base">{t.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {t.reasons.map((reason, i) => {
            const Icon = reasonIcons[i];
            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.4 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, borderColor: "rgba(37,99,235,0.15)" }}
                className="group flex gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:bg-white/[0.04] md:gap-5 md:rounded-2xl md:p-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] transition-colors group-hover:bg-blue-600/10 md:h-12 md:w-12 md:rounded-xl">
                  <Icon className="h-4 w-4 text-blue-500 md:h-5 md:w-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="mb-1.5 text-sm font-bold text-white md:mb-2 md:text-base">{reason.title}</h3>
                  <p className="text-xs leading-relaxed text-white/40 md:text-sm">{reason.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
