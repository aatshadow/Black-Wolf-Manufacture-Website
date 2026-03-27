"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  BarChart3,
  Users,
  Package,
  Shield,
  Bot,
  Activity,
  PieChart,
  TrendingUp,
  FileText,
  Target,
  Mail,
  Repeat,
  Truck,
  ClipboardList,
  Settings,
  Cpu,
  Eye,
  AlertTriangle,
  Lock,
  Wifi,
  MessageSquare,
  Zap,
  Search,
  Brain,
} from "lucide-react";
import { useLang, translations } from "@/lib/i18n";

const columnIcons = [BarChart3, Users, Package, Shield, Bot];
const featureIconSets = [
  [Activity, PieChart, TrendingUp, FileText, Target, BarChart3],
  [Target, Mail, MessageSquare, ClipboardList, Repeat, Users],
  [Package, Truck, ClipboardList, Settings, Users, Repeat],
  [Eye, Cpu, AlertTriangle, Wifi, Lock, Search],
  [Brain, Zap, FileText, TrendingUp, Target, Repeat],
];

export function BentoServices() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const lang = useLang();
  const t = translations.bento[lang];

  return (
    <section className="relative bg-transparent py-16 md:py-32" ref={ref}>
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 text-center md:mb-16"
        >
          <h2 className="mb-3 text-[clamp(24px,3.5vw,48px)] font-light tracking-[-0.02em] text-white md:mb-4">
            {t.title}
          </h2>
          <p className="text-sm text-white/50 md:text-base">
            {t.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-5">
          {t.columns.map((col, i) => {
            const ColIcon = columnIcons[i];
            const featureIcons = featureIconSets[i];
            return (
              <motion.div
                key={col.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4 }}
                className="group flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-blue-500/15 hover:bg-white/[0.04]"
              >
                {/* Header */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-600/10">
                    <ColIcon className="h-4 w-4 text-blue-400" />
                  </div>
                </div>
                <h3 className="mb-4 text-sm font-medium text-white">{col.title}</h3>

                {/* Features */}
                <div className="flex flex-col gap-2.5">
                  {col.features.map((feature, fi) => {
                    const FeatureIcon = featureIcons[fi];
                    return (
                      <div key={feature} className="flex items-center gap-2.5">
                        <FeatureIcon className="h-3.5 w-3.5 shrink-0 text-white/20" />
                        <span className="text-xs text-white/45">{feature}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
