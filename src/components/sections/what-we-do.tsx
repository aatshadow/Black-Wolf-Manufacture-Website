"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { LayoutGrid, Shield, Brain } from "lucide-react";

const services = [
  {
    icon: LayoutGrid,
    title: "Unified Business System",
    description: "CRM, ERP, and BI dashboard in one platform. Real-time visibility into every aspect of your operations.",
    animation: "float" as const,
  },
  {
    icon: Shield,
    title: "Cybersecurity & Defense",
    description: "24/7 AI-powered threat monitoring, automated blocking, and SOC dashboard. Enterprise-grade protection.",
    animation: "pulse" as const,
  },
  {
    icon: Brain,
    title: "AI & Automation",
    description: "Custom AI agents that automate repetitive tasks, analyze data, and support decision-making in real time.",
    animation: "drift" as const,
  },
];

const iconAnimations = {
  float: { y: [0, -6, 0], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const } },
  pulse: { scale: [1, 1.06, 1], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const } },
  drift: { x: [0, 4, 0], y: [0, -3, 0], transition: { duration: 5, repeat: Infinity, ease: "easeInOut" as const } },
};

export function WhatWeDo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative bg-transparent py-16 md:py-32" ref={ref}>
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 text-center md:mb-16"
        >
          <h2 className="mb-3 text-[clamp(24px,3.5vw,48px)] font-light tracking-[-0.02em] text-white md:mb-4">
            What We Do
          </h2>
          <p className="text-sm text-white/40 md:text-base">Three pillars of digital transformation for manufacturing</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.5 + i * 0.2, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6, borderColor: "rgba(37,99,235,0.2)" }}
              className="group relative flex flex-col items-center rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center transition-all duration-500 hover:bg-white/[0.04] md:p-8"
            >
              <motion.div
                animate={iconAnimations[service.animation]}
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] md:mb-6 md:h-14 md:w-14"
              >
                <service.icon className="h-5 w-5 text-blue-500 md:h-6 md:w-6" strokeWidth={1.5} />
              </motion.div>
              <h3 className="mb-2 text-lg font-bold text-white md:mb-3 md:text-xl">{service.title}</h3>
              <p className="text-sm leading-relaxed text-white/40">{service.description}</p>
              <div className="absolute inset-0 -z-10 rounded-2xl bg-blue-600/5 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
