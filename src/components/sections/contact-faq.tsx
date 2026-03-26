"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Accordion } from "@/components/ui/accordion";

const faqItems = [
  {
    question: "How long does implementation take?",
    answer: "Our standard implementation takes 5 weeks from kickoff to launch. This includes discovery, architecture, development, deployment, and optimization.",
  },
  {
    question: "Do we need to replace our existing systems?",
    answer: "Not necessarily. BlackWolf can integrate with your existing tools or replace them entirely — depending on what makes sense for your business.",
  },
  {
    question: "What's the minimum commitment?",
    answer: "Our contracts are month-to-month after the initial implementation period. We believe in earning your business every month.",
  },
  {
    question: "Which countries do you serve?",
    answer: "We currently serve manufacturing companies across Europe, with a strong presence in Bulgaria and Spain. Our team operates in English, Spanish, and Bulgarian.",
  },
];

export function ContactFAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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
            Common Questions
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion items={faqItems} />
        </motion.div>
      </div>
    </section>
  );
}
