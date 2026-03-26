"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const words = "We build the operating system your factory needs".split(" ");

export function Hero() {
  return (
    <section className="relative flex flex-1 items-center justify-center overflow-hidden pt-[72px]">
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 backdrop-blur-sm md:mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-600 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
          </span>
          <span className="text-[11px] font-medium tracking-wider text-white/50 md:text-xs">All-in-One Digital Infrastructure</span>
        </motion.div>

        {/* Title — slower, smoother word reveal */}
        <h1 className="mb-5 text-[clamp(32px,6vw,68px)] font-light leading-[1.08] tracking-[-0.03em] text-white md:mb-8">
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 25, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.8,
                delay: 0.8 + i * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="inline-block"
              style={{ marginRight: "0.28em" }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mb-10 max-w-2xl text-[15px] leading-relaxed text-white/40 md:mb-12 md:text-lg"
        >
          Stop running your factory on spreadsheets and gut instinct. One integrated system — operations, security, intelligence — deployed in 5 weeks.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <Link href="/services" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 0 40px rgba(37,99,235,0.25)" }}
              whileTap={{ scale: 0.97 }}
              className="w-full rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 sm:w-auto"
            >
              Explore Our Services
            </motion.button>
          </Link>
          <Link href="/contact" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full rounded-full border border-white/10 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:border-white/20 hover:bg-white/[0.04] sm:w-auto"
            >
              Book a Call
            </motion.button>
          </Link>
        </motion.div>
      </div>

    </section>
  );
}
