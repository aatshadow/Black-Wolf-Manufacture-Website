"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Accordion } from "@/components/ui/accordion";
import { useLang, translations } from "@/lib/i18n";

export function ContactFAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const lang = useLang();
  const faqData = translations.faq[lang];
  const title = translations.faqTitle[lang];

  return (
    <section className="relative bg-transparent py-16 md:py-32" ref={ref}>
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center md:mb-12"
        >
          <h2 className="text-[clamp(24px,3.5vw,48px)] font-light tracking-[-0.02em] text-white">
            {title}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion items={faqData} />
        </motion.div>
      </div>
    </section>
  );
}
