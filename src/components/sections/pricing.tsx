"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Essentials",
    description: "For companies starting their digital transformation",
    features: [
      "All-in-One platform access",
      "BI Dashboard with core KPIs",
      "Basic CRM & ERP modules",
      "Cybersecurity monitoring",
      "Email support",
      "5-week implementation",
    ],
    featured: false,
  },
  {
    name: "Growth",
    description: "For companies ready to scale with AI",
    features: [
      "Everything in Essentials",
      "Advanced BI with custom reports",
      "Full CRM, ERP & HR modules",
      "AI-powered security with SOC",
      "Custom AI agents (up to 3)",
      "Priority support",
      "Dedicated account manager",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    description: "For large operations with specific requirements",
    features: [
      "Everything in Growth",
      "Unlimited AI agents",
      "Custom integrations",
      "Multi-site deployment",
      "On-site training",
      "SLA guarantee",
      "24/7 dedicated support",
    ],
    featured: false,
  },
  {
    name: "Digitalization Programs",
    description: "Government-funded digital transformation for SMEs in Spain & Bulgaria",
    features: [
      "Custom ERP systems",
      "CRM & sales automation",
      "Website & eCommerce stores",
      "Business Intelligence dashboards",
      "Process automation & AI",
      "Full compliance & reporting",
      "We handle all the paperwork",
    ],
    featured: false,
    badge: "🇪🇸 🇧🇬 Gov. Subsidized",
  },
];

export function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative bg-transparent py-16 md:py-32" ref={ref}>
      <div className="mx-auto max-w-[1400px] px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 text-center md:mb-16"
        >
          <h2 className="mb-3 text-[clamp(24px,3.5vw,48px)] font-light tracking-[-0.02em] text-white md:mb-4">
            Roadmap
          </h2>
          <p className="text-sm text-white/50 md:text-base">
            Choose the plan that fits your growth stage
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8 }}
              className={`relative flex flex-col rounded-2xl border p-5 transition-all md:p-7 ${
                plan.featured
                  ? "border-blue-500/30 bg-gradient-to-b from-blue-600/[0.08] to-transparent shadow-[0_0_60px_-20px_rgba(37,99,235,0.2)]"
                  : "badge" in plan
                    ? "border-blue-500/15 bg-gradient-to-b from-blue-600/[0.04] to-transparent"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-bold text-white">
                  Most Popular
                </div>
              )}

              {"badge" in plan && plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-blue-500/30 bg-blue-600/20 px-4 py-1 text-xs font-bold text-blue-300">
                  {plan.badge}
                </div>
              )}

              <div className="mb-5 md:mb-6">
                <h3 className="mb-2 text-lg font-medium text-white">{plan.name}</h3>
                <p className="text-xs text-white/40 md:text-sm">{plan.description}</p>
              </div>

              <ul className="mb-6 flex-1 space-y-2 md:mb-8 md:space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-white/60">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-500/60" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href="/contact" className="block">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full rounded-full py-3 text-sm font-semibold transition-all ${
                    plan.featured
                      ? "bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_0_24px_rgba(37,99,235,0.3)]"
                      : "border border-white/10 text-white hover:border-white/25 hover:bg-white/[0.04]"
                  }`}
                >
                  Book a Call
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
