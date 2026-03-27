"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Landmark, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLang, translations, localePath } from "@/lib/i18n";

export function GovPrograms() {
  const lang = useLang();
  const t = translations.govPrograms[lang];
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative bg-transparent py-16 md:py-24" ref={ref}>
      <div className="mx-auto max-w-[900px] px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden rounded-2xl border border-blue-500/15 bg-gradient-to-br from-blue-600/[0.06] via-white/[0.02] to-blue-600/[0.04] p-6 text-center md:rounded-3xl md:p-12"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-600/10 md:mb-5">
            <Landmark className="h-5 w-5 text-blue-400" />
          </div>

          <h3 className="mb-3 text-xl font-light text-white md:text-2xl">
            {t.title}
          </h3>

          <p className="mx-auto mb-6 max-w-xl text-sm leading-relaxed text-white/50 md:text-base">
            {t.description}
          </p>

          <div className="mb-6 flex flex-wrap items-center justify-center gap-3 md:mb-8">
            <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-white/50">
              {t.kitDigital}
            </span>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-white/50">
              {t.bgGrants}
            </span>
          </div>

          <Link href={localePath("/contact", lang)}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-600/10 px-6 py-2.5 text-sm font-medium text-blue-400 transition-all hover:bg-blue-600/20"
            >
              {t.cta}
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
