"use client";

import { motion } from "framer-motion";

interface HeroSmallProps {
  badge: string;
  title: string;
  subtitle: string;
}

export function HeroSmall({ badge, title, subtitle }: HeroSmallProps) {
  const words = title.split(" ");
  return (
    <section className="relative flex min-h-[40vh] items-center justify-center overflow-hidden pt-[72px] md:min-h-[50vh]">
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-12 text-center md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 md:mb-6"
        >
          <span className="text-[11px] font-medium tracking-wider text-white/50 md:text-xs">{badge}</span>
        </motion.div>

        <h1 className="mb-5 text-[clamp(28px,5vw,56px)] font-light leading-[1.08] tracking-[-0.03em] text-white md:mb-6">
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.7,
                delay: 0.5 + i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="inline-block"
              style={{ marginRight: "0.28em" }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-xl text-sm leading-relaxed text-white/40 md:text-base"
        >
          {subtitle}
        </motion.p>
      </div>
    </section>
  );
}
