"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const problems = [
  {
    stat: "73%",
    label: "of manufacturers still run on spreadsheets",
    detail: "Manual data entry, disconnected tools, and zero real-time visibility into operations.",
  },
  {
    stat: "€2.4M",
    label: "lost annually to operational inefficiency",
    detail: "Missed orders, production delays, inventory errors — problems that compound every quarter.",
  },
  {
    stat: "0",
    label: "factories have integrated digital infrastructure",
    detail: "Most have a CRM here, an ERP there, and no connection between them. No single source of truth.",
  },
];

export function ProblemFraming() {
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
          <p className="mb-3 text-[10px] font-medium tracking-[0.3em] text-red-400/50 md:text-xs">
            THE PROBLEM
          </p>
          <h2 className="mb-4 text-[clamp(24px,3.5vw,48px)] font-light tracking-[-0.02em] text-white md:mb-5">
            Manufacturing is stuck in the past
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-white/40 md:text-base">
            While every other industry has gone digital, factories still rely on paper, spreadsheets, and gut instinct.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {problems.map((problem, i) => (
            <motion.div
              key={problem.stat}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.5 + i * 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8"
            >
              <div className="mb-3 text-3xl font-light text-red-400/70 md:mb-4 md:text-4xl">
                {problem.stat}
              </div>
              <p className="mb-2 text-sm font-medium text-white/70 md:mb-3">
                {problem.label}
              </p>
              <p className="text-xs leading-relaxed text-white/50">
                {problem.detail}
              </p>
              <div className="absolute inset-0 -z-10 rounded-2xl bg-red-600/[0.02] opacity-0 blur-xl transition-opacity duration-500 hover:opacity-100" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-10 text-center md:mt-16"
        >
          <p className="text-sm text-white/45 md:text-base">
            There&apos;s a better way.{" "}
            <span className="text-blue-400/80">We built it.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
