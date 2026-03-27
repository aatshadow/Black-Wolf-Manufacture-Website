"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { TrendingUp, Clock, Users, BarChart3, Zap, DollarSign } from "lucide-react";
import { useLang, translations } from "@/lib/i18n";

const caseStudies = [
  {
    company: "Kingly",
    category: "Manufacturing",
    industry: "Textile Manufacturing",
    location: "Bulgaria",
    description:
      "Kingly is a textile manufacturing company that was drowning in manual processes. Order processing relied on a team of five people manually transferring data between Excel spreadsheets and Gmail. Follow-ups were lost, production schedules were guesswork, and management had zero real-time visibility into operations.",
    before: [
      "5 people manually processing orders in Excel",
      "Follow-ups lost in Gmail threads",
      "Production scheduling based on guesswork",
      "No visibility into business performance",
      "Data scattered across disconnected tools",
    ],
    after: [
      "Fully automated order processing pipeline",
      "Centralized CRM with automated follow-ups",
      "Real-time production tracking dashboard",
      "Mobile-first monitoring for management",
      "Single source of truth for all business data",
    ],
    metrics: [
      { label: "Order Processing Time", value: "-73%", icon: Clock },
      { label: "Lost Follow-ups", value: "0", icon: TrendingUp },
      { label: "Staff Reallocated", value: "4", icon: Users },
      { label: "Real-time KPIs", value: "24/7", icon: BarChart3 },
    ],
  },
  {
    company: "FBA Pro Academy",
    category: "Digital Business",
    industry: "E-Commerce Education",
    location: "Spain",
    description:
      "FBA Pro Academy had invested heavily in tech teams over the years, but nobody truly understood the intelligence and business processes the way they needed. Previous developers built tools that didn't fit, wasted budget, and left the team operating in chaos — losing sales due to lack of visibility and control.",
    before: [
      "Multiple tech teams hired — none delivered what was needed",
      "No understanding of business logic and processes",
      "Sales lost due to lack of intelligence and control",
      "Team operating in chaos with no unified system",
      "Significant budget wasted on failed tech implementations",
    ],
    after: [
      "Custom CRM tailored to their exact sales process",
      "Custom ERP for operations and fulfillment management",
      "Client-facing application for their students",
      "Business Intelligence & reporting for the entire team",
      "Custom Task Manager for internal coordination",
    ],
    metrics: [
      { label: "Full Visibility", value: "100%", icon: BarChart3 },
      { label: "Lost Sales", value: "0", icon: TrendingUp },
      { label: "Systems Unified", value: "5", icon: Zap },
      { label: "Team Efficiency", value: "+80%", icon: Users },
    ],
  },
  {
    company: "CreatorFounder",
    category: "Digital Business",
    industry: "Creator Economy — Pedro Buerbaum",
    location: "Spain",
    description:
      "CreatorFounder is the brand of Pedro Buerbaum, one of Spain's most recognized digital entrepreneurs with over 3 million followers. Despite massive reach, the business had no structured processes — launches were chaotic, fulfillment was manual, and there was zero system connecting sales, delivery, and community.",
    before: [
      "No structured business processes despite massive audience",
      "Chaotic product launches with manual coordination",
      "No CRM, no ERP, no fulfillment automation",
      "Sales systems disconnected from delivery",
      "Community management without proper tooling",
    ],
    after: [
      "Complete launch infrastructure and strategy",
      "Community platform and student application",
      "Full CRM, ERP, and fulfillment automation",
      "AI agents handling repetitive operations",
      "End-to-end sales systems running on autopilot",
    ],
    metrics: [
      { label: "Revenue in 1 Month", value: "€500K+", icon: DollarSign },
      { label: "Followers Reached", value: "3M+", icon: Users },
      { label: "Systems Automated", value: "100%", icon: Zap },
      { label: "Launch Success", value: "1st Try", icon: TrendingUp },
    ],
  },
];

export function CaseStudies() {
  const lang = useLang();
  const t = translations.caseStudies[lang];
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative bg-transparent py-16 md:py-32" ref={ref}>
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 text-center md:mb-20"
        >
          <h2 className="mb-4 text-[clamp(28px,3.5vw,48px)] font-light tracking-[-0.02em] text-white">
            {t.title}
          </h2>
          <p className="text-sm text-white/50 md:text-base">{t.subtitle}</p>
        </motion.div>

        <div className="flex flex-col gap-12 md:gap-24">
          {caseStudies.map((study, idx) => (
            <motion.div
              key={study.company}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.3 + idx * 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] md:rounded-3xl"
            >
              {/* Header */}
              <div className="border-b border-white/[0.06] p-5 md:p-12">
                <div className="mb-2 flex items-center gap-3">
                  <span className="rounded-full bg-blue-600/10 px-3 py-1 text-xs font-bold text-blue-500">
                    {study.category}
                  </span>
                  <span className="text-xs text-white/45">{study.location}</span>
                </div>
                <h3 className="mb-1 text-2xl font-light text-white md:text-4xl">{study.company}</h3>
                <p className="mb-3 text-sm font-medium text-blue-400/80 md:mb-4">{study.industry}</p>
                <p className="max-w-3xl text-sm leading-relaxed text-white/50">{study.description}</p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 border-b border-white/[0.06] md:grid-cols-4">
                {study.metrics.map((metric, i) => (
                  <div
                    key={metric.label}
                    className={`flex flex-col items-center justify-center p-4 md:p-6 ${
                      i % 2 === 0 ? "border-r border-white/[0.06]" : ""
                    } ${i < 2 ? "border-b border-white/[0.06] md:border-b-0" : ""} ${
                      i < study.metrics.length - 1 ? "md:border-r" : "md:border-r-0"
                    }`}
                  >
                    <metric.icon className="mb-2 h-4 w-4 text-blue-500/60 md:h-5 md:w-5" />
                    <div className="text-xl font-light text-white md:text-2xl">{metric.value}</div>
                    <div className="text-center text-[9px] font-medium tracking-wide text-white/40 md:text-[10px]">
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Before / After */}
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="border-b border-white/[0.06] p-5 md:border-b-0 md:border-r md:p-12">
                  <h4 className="mb-3 text-xs font-bold tracking-[0.2em] text-red-400/60 md:mb-4">{t.before}</h4>
                  <ul className="space-y-2 md:space-y-3">
                    {study.before.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-white/40 md:gap-3 md:text-sm">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500/40" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-5 md:p-12">
                  <h4 className="mb-3 text-xs font-bold tracking-[0.2em] text-green-400/60 md:mb-4">
                    {t.after}
                  </h4>
                  <ul className="space-y-2 md:space-y-3">
                    {study.after.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-white/60 md:gap-3 md:text-sm">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500/60" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
