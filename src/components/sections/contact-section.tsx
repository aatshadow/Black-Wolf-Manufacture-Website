"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { User, Mail, Building, MessageSquare, Phone, Send, ArrowRight, CheckCircle, Clock, Globe, Shield, Zap } from "lucide-react";

const companyStats = [
  { label: "Response Time", value: "< 2h", icon: Clock },
  { label: "Markets", value: "EU", icon: Globe },
  { label: "Security", value: "SOC 2", icon: Shield },
  { label: "Uptime", value: "99.9%", icon: Zap },
];

export function ContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [formData, setFormData] = useState({ name: "", company: "", email: "", phone: "", size: "", revenue: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Required";
    if (!formData.email.trim()) newErrors.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <section className="relative bg-transparent py-12 md:py-20" ref={ref}>
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10 grid grid-cols-2 gap-3 md:mb-16 md:grid-cols-4 md:gap-4"
        >
          {companyStats.map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05, y: -4 }}
              className="flex flex-col items-center rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center md:rounded-2xl md:p-5"
            >
              <stat.icon className="mb-1.5 h-4 w-4 text-blue-500/60 md:mb-2 md:h-5 md:w-5" />
              <div className="text-lg font-light text-white md:text-xl">{stat.value}</div>
              <div className="text-[9px] font-medium text-white/40 md:text-[10px]">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <h3 className="mb-2 text-xl font-bold text-white md:text-2xl">Send us a message</h3>
            <p className="mb-6 text-sm text-white/40 md:mb-8">Fill out the form and we&apos;ll get back to you within 24 hours.</p>

            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form key="form" onSubmit={handleSubmit} className="space-y-4 md:space-y-5" exit={{ opacity: 0, y: -20 }}>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
                    <div>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                        <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} className={`w-full rounded-xl border bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-blue-500/50 md:py-3.5 ${errors.name ? "border-red-500/50" : "border-white/[0.08]"}`} />
                      </div>
                    </div>
                    <div>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                        <input type="text" placeholder="Company Name" value={formData.company} onChange={(e) => handleChange("company", e.target.value)} className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-blue-500/50 md:py-3.5" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
                    <div>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                        <input type="email" placeholder="Email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} className={`w-full rounded-xl border bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-blue-500/50 md:py-3.5 ${errors.email ? "border-red-500/50" : "border-white/[0.08]"}`} />
                      </div>
                    </div>
                    <div>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                        <input type="tel" placeholder="Phone (optional)" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-blue-500/50 md:py-3.5" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
                    <select value={formData.size} onChange={(e) => handleChange("size", e.target.value)} className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white/60 outline-none transition-colors focus:border-blue-500/50 md:py-3.5">
                      <option value="">Company Size</option>
                      <option value="1-20">1-20 employees</option>
                      <option value="20-50">20-50 employees</option>
                      <option value="50-200">50-200 employees</option>
                      <option value="200+">200+ employees</option>
                    </select>
                    <select value={formData.revenue} onChange={(e) => handleChange("revenue", e.target.value)} className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white/60 outline-none transition-colors focus:border-blue-500/50 md:py-3.5">
                      <option value="">Annual Revenue</option>
                      <option value="<1M">Under 1M EUR</option>
                      <option value="1-5M">1-5M EUR</option>
                      <option value="5-15M">5-15M EUR</option>
                      <option value="15-30M">15-30M EUR</option>
                      <option value="30M+">30M+ EUR</option>
                    </select>
                  </div>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3.5 h-4 w-4 text-white/45" />
                    <textarea placeholder="Tell us about your business..." rows={4} value={formData.message} onChange={(e) => handleChange("message", e.target.value)} className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-blue-500/50 md:py-3.5" />
                  </div>
                  <motion.button type="submit" disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="group relative w-full overflow-hidden rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white transition-all hover:bg-blue-500 disabled:opacity-50 md:py-4">
                    <motion.div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" initial={{ x: "-100%" }} whileHover={{ x: "100%" }} transition={{ duration: 0.5 }} />
                    <span className="relative flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <motion.div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                      ) : (
                        <><Send className="h-4 w-4" /> Send Message <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>
                      )}
                    </span>
                  </motion.button>
                  <p className="text-center text-[10px] text-white/20 md:text-[11px]">We respect your privacy. Your information will never be shared.</p>
                </motion.form>
              ) : (
                <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-8 text-center md:py-12">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-green-400/30 bg-green-500/20 md:mb-6 md:h-20 md:w-20">
                    <CheckCircle className="h-8 w-8 text-green-400 md:h-10 md:w-10" />
                  </motion.div>
                  <h3 className="mb-3 text-xl font-bold text-white md:mb-4 md:text-2xl">Message Sent!</h3>
                  <p className="mb-5 text-sm text-white/50 md:mb-6">Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
                  <motion.button onClick={() => { setIsSubmitted(false); setFormData({ name: "", company: "", email: "", phone: "", size: "", revenue: "", message: "" }); }} whileHover={{ scale: 1.05 }} className="rounded-xl border border-white/10 px-6 py-3 text-sm text-white hover:bg-white/[0.04]">
                    Send Another Message
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right side - Calendly */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h3 className="mb-2 text-xl font-bold text-white md:text-2xl">Schedule a consultation</h3>
            <p className="mb-6 text-sm text-white/40 md:mb-8">Prefer to talk directly? Book a 30-minute call with our team.</p>
            <div className="overflow-hidden rounded-xl border border-white/[0.06] md:rounded-2xl">
              <iframe
                src="https://calendly.com/alex-ceo-blackwolfsec/1-1s?utm_source=website&utm_medium=embed&utm_campaign=business_consultation&utm_content=booking_page&hide_gdpr_banner=1&background_color=0a0a15&text_color=e4e4e7&primary_color=2563eb"
                width="100%"
                height="700"
                frameBorder="0"
                title="Schedule a consultation with BlackWolf"
                className="min-h-[500px] bg-[#0a0a15] md:min-h-[700px]"
              />
            </div>
            <div className="mt-5 md:mt-6">
              <p className="mb-2 text-[10px] text-white/20 md:mb-3 md:text-xs">Or reach us directly:</p>
              <a href="mailto:contact@blackwolfsec.io" className="flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-blue-400">
                <Mail className="h-4 w-4" />
                contact@blackwolfsec.io
              </a>
              <p className="mt-2 text-[10px] text-white/15 md:mt-3 md:text-xs">Based in Europe — serving manufacturers across the continent.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
