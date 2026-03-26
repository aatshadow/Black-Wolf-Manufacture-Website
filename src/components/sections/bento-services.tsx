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

const columns = [
  {
    title: "Business Dashboard & BI",
    icon: BarChart3,
    color: "blue",
    features: [
      { name: "Real-time KPI Monitoring", icon: Activity },
      { name: "Revenue & P&L Analytics", icon: PieChart },
      { name: "Sales Performance Tracking", icon: TrendingUp },
      { name: "Custom Report Builder", icon: FileText },
      { name: "Team Leaderboards", icon: Target },
      { name: "Operational Metrics", icon: BarChart3 },
    ],
  },
  {
    title: "CRM & Sales",
    icon: Users,
    color: "blue",
    features: [
      { name: "Lead Tracking & Pipeline", icon: Target },
      { name: "Automated Follow-ups", icon: Mail },
      { name: "Client Communication Log", icon: MessageSquare },
      { name: "Order Management", icon: ClipboardList },
      { name: "Sales Automation", icon: Repeat },
      { name: "Contact Database", icon: Users },
    ],
  },
  {
    title: "ERP & Operations",
    icon: Package,
    color: "blue",
    features: [
      { name: "Inventory Management", icon: Package },
      { name: "Procurement & Purchasing", icon: Truck },
      { name: "Production Planning", icon: ClipboardList },
      { name: "Parametric Engine", icon: Settings },
      { name: "HR & Team Management", icon: Users },
      { name: "Workflow Automation", icon: Repeat },
    ],
  },
  {
    title: "Cybersecurity & SOC",
    icon: Shield,
    color: "blue",
    features: [
      { name: "24/7 Threat Monitoring", icon: Eye },
      { name: "AI-Powered Detection", icon: Cpu },
      { name: "Incident Response", icon: AlertTriangle },
      { name: "Network Security", icon: Wifi },
      { name: "Access Control", icon: Lock },
      { name: "Security Analytics", icon: Search },
    ],
  },
  {
    title: "AI Agents & Automation",
    icon: Bot,
    color: "blue",
    features: [
      { name: "Custom AI Agents", icon: Brain },
      { name: "Data Entry Automation", icon: Zap },
      { name: "Report Generation", icon: FileText },
      { name: "Trend Analysis", icon: TrendingUp },
      { name: "Decision Support", icon: Target },
      { name: "Process Automation", icon: Repeat },
    ],
  },
];

export function BentoServices() {
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
          <h2 className="mb-3 text-[clamp(24px,3.5vw,48px)] font-light tracking-[-0.02em] text-white md:mb-4">
            The All-in-One System
          </h2>
          <p className="text-sm text-white/50 md:text-base">
            Everything your business needs — fully integrated from day one
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-5">
          {columns.map((col, i) => (
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
                  <col.icon className="h-4 w-4 text-blue-400" />
                </div>
              </div>
              <h3 className="mb-4 text-sm font-medium text-white">{col.title}</h3>

              {/* Features */}
              <div className="flex flex-col gap-2.5">
                {col.features.map((feature) => (
                  <div key={feature.name} className="flex items-center gap-2.5">
                    <feature.icon className="h-3.5 w-3.5 shrink-0 text-white/20" />
                    <span className="text-xs text-white/45">{feature.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
