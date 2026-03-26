"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

interface CTAProps {
  title: string;
  subtitle: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function CTA({
  title,
  subtitle,
  primaryLabel = "Book a Call",
  primaryHref = "/contact",
  secondaryLabel,
  secondaryHref,
}: CTAProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative bg-transparent py-16 md:py-32" ref={ref}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-[200px] w-[300px] rounded-full bg-blue-600/5 blur-[80px] md:h-[300px] md:w-[500px] md:blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-[800px] px-4 text-center md:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-3 text-[clamp(24px,3.5vw,48px)] font-light tracking-[-0.02em] text-white md:mb-4"
        >
          {title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 text-sm text-white/40 md:mb-10 md:text-base"
        >
          {subtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <Link href={primaryHref} className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(37,99,235,0.3)" }}
              whileTap={{ scale: 0.97 }}
              className="w-full rounded-full bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white hover:bg-blue-500 sm:w-auto"
            >
              {primaryLabel}
            </motion.button>
          </Link>
          {secondaryLabel && secondaryHref && (
            <Link href={secondaryHref} className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full rounded-full border border-white/10 px-7 py-3.5 text-sm font-semibold text-white hover:border-white/25 hover:bg-white/[0.04] sm:w-auto"
              >
                {secondaryLabel}
              </motion.button>
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
}
