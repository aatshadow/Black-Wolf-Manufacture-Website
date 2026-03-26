"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const stats = [
  { value: "5 weeks", label: "Average deployment" },
  { value: "3-30M", label: "Client revenue (EUR)" },
  { value: "20-200", label: "Client employee range" },
  { value: "Europe", label: "Our market" },
];

export function AboutStory() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative bg-transparent py-16 md:py-32" ref={ref}>
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="mb-4 text-[clamp(24px,3.5vw,48px)] font-light tracking-[-0.02em] text-white md:mb-6">
              Our Story
            </h2>
            <p className="mb-3 text-sm leading-relaxed text-white/50 md:mb-4">
              Manufacturing is the backbone of the European economy. Yet most factories still run on spreadsheets, disconnected tools, and gut feeling.
            </p>
            <p className="mb-3 text-sm leading-relaxed text-white/50 md:mb-4">
              We saw an opportunity: build a complete, integrated digital system — operations, security, and intelligence — and deliver it in weeks, not months.
            </p>
            <p className="text-sm leading-relaxed text-white/60">
              That&apos;s BlackWolf. One team. One system. One mission: <span className="text-blue-400">eliminate operational chaos.</span>
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.5 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, borderColor: "rgba(37,99,235,0.2)" }}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center transition-all md:rounded-2xl md:p-6"
              >
                <div className="mb-1 text-xl font-light text-white md:text-2xl">{stat.value}</div>
                <div className="text-[10px] text-white/40 md:text-xs">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
