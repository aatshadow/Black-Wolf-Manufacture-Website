'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  Layout,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  X,
  Globe,
  Sparkles,
  ChevronDown,
  Mail,
} from 'lucide-react';
import { useState } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const steps = [
  { label: 'Organization', icon: Building2 },
  { label: 'Invite Team', icon: Users },
  { label: 'Choose Template', icon: Layout },
];

const industries = [
  { value: 'furniture_manufacturing', label: 'Furniture Manufacturing' },
  { value: 'food_processing', label: 'Food Processing' },
  { value: 'textile', label: 'Textile & Apparel' },
  { value: 'metal_fabrication', label: 'Metal Fabrication' },
  { value: 'construction', label: 'Construction' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'pharma', label: 'Pharmaceuticals' },
  { value: 'other', label: 'Other' },
];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'bg', label: 'Bulgarian' },
  { value: 'de', label: 'German' },
  { value: 'ro', label: 'Romanian' },
  { value: 'sr', label: 'Serbian' },
];

const templates = [
  {
    id: 't1',
    name: 'ERP Discovery — Manufacturing',
    description: 'Comprehensive knowledge extraction for manufacturing ERP implementation',
    tracks: 3,
    fields: 186,
    popular: true,
  },
  {
    id: 't2',
    name: 'CRM Discovery — General',
    description: 'Sales process, customer management, and pipeline mapping',
    tracks: 2,
    fields: 94,
    popular: false,
  },
  {
    id: 't3',
    name: 'Digital Transformation Assessment',
    description: 'Evaluate current digital maturity and identify improvement areas',
    tracks: 4,
    fields: 220,
    popular: false,
  },
  {
    id: 't4',
    name: 'Blank Template',
    description: 'Start from scratch with a custom knowledge extraction schema',
    tracks: 0,
    fields: 0,
    popular: false,
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [orgName, setOrgName] = useState('');
  const [orgIndustry, setOrgIndustry] = useState('');
  const [orgLanguage, setOrgLanguage] = useState('en');
  const [invites, setInvites] = useState<string[]>(['']);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  function addInvite() {
    setInvites([...invites, '']);
  }

  function removeInvite(idx: number) {
    setInvites(invites.filter((_, i) => i !== idx));
  }

  function updateInvite(idx: number, value: string) {
    const updated = [...invites];
    updated[idx] = value;
    setInvites(updated);
  }

  function next() {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  }

  function prev() {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  }

  return (
    <div className="min-h-screen bg-[#050510] flex flex-col items-center justify-center p-6">
      {/* Background effects */}
      <div className="kea-mesh-bg" />
      <div className="kea-mesh-lines" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-[640px]"
      >
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center mx-auto mb-4"
          >
            <Sparkles size={24} className="text-blue-400" />
          </motion.div>
          <h1 className="text-xl font-bold text-white mb-1">Welcome to KEA</h1>
          <p className="text-sm text-white/30">Let&apos;s set up your organization in a few steps</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, i) => {
            const StepIcon = step.icon;
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            return (
              <div key={step.label} className="flex items-center gap-2">
                {i > 0 && (
                  <div className={`w-8 h-px ${isDone ? 'bg-blue-400' : 'bg-white/10'}`} />
                )}
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-500/15 border border-blue-500/20'
                      : isDone
                        ? 'bg-emerald-500/10 border border-emerald-500/15'
                        : 'bg-white/[0.03] border border-white/[0.06]'
                  }`}
                >
                  {isDone ? (
                    <Check size={14} className="text-emerald-400" />
                  ) : (
                    <StepIcon size={14} className={isActive ? 'text-blue-400' : 'text-white/25'} />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      isActive ? 'text-blue-400' : isDone ? 'text-emerald-400' : 'text-white/25'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="kea-card kea-glow-border p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Organization */}
            {currentStep === 0 && (
              <motion.div
                key="step-org"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-5"
              >
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Create Your Organization</h3>
                  <p className="text-xs text-white/30">
                    Tell us about your company so we can customize the experience
                  </p>
                </div>

                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Organization Name</label>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                    <input
                      type="text"
                      className="kea-input pl-9 text-sm"
                      placeholder="Acme Corp"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Industry</label>
                  <div className="relative">
                    <select
                      className="kea-input text-sm appearance-none"
                      value={orgIndustry}
                      onChange={(e) => setOrgIndustry(e.target.value)}
                    >
                      <option value="">Select industry...</option>
                      {industries.map((ind) => (
                        <option key={ind.value} value={ind.value}>
                          {ind.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Primary Language</label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                    <select
                      className="kea-input pl-9 text-sm appearance-none"
                      value={orgLanguage}
                      onChange={(e) => setOrgLanguage(e.target.value)}
                    >
                      {languages.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Invite Team */}
            {currentStep === 1 && (
              <motion.div
                key="step-invite"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-5"
              >
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Invite Your Team</h3>
                  <p className="text-xs text-white/30">
                    Add colleagues who will participate in knowledge extraction sessions
                  </p>
                </div>

                <div className="space-y-3">
                  {invites.map((email, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-2"
                    >
                      <div className="relative flex-1">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                        <input
                          type="email"
                          className="kea-input pl-9 text-sm"
                          placeholder="colleague@company.com"
                          value={email}
                          onChange={(e) => updateInvite(i, e.target.value)}
                        />
                      </div>
                      {invites.length > 1 && (
                        <button
                          onClick={() => removeInvite(i)}
                          className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/20 transition-colors"
                        >
                          <X size={14} className="text-white/25" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>

                <button
                  onClick={addInvite}
                  className="kea-btn-secondary text-xs py-2 px-4 flex items-center gap-2"
                >
                  <Plus size={12} /> Add Another
                </button>

                <p className="text-[10px] text-white/15">
                  You can skip this step and invite users later from Settings.
                </p>
              </motion.div>
            )}

            {/* Step 3: Select Template */}
            {currentStep === 2 && (
              <motion.div
                key="step-template"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-5"
              >
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Choose a Template</h3>
                  <p className="text-xs text-white/30">
                    Select a pre-built extraction schema or start from scratch
                  </p>
                </div>

                <div className="space-y-3">
                  {templates.map((tmpl, i) => (
                    <motion.button
                      key={tmpl.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      onClick={() => setSelectedTemplate(tmpl.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        selectedTemplate === tmpl.id
                          ? 'bg-blue-500/10 border-blue-500/20'
                          : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-white/80">{tmpl.name}</span>
                            {tmpl.popular && (
                              <span className="kea-badge kea-badge-amber">Popular</span>
                            )}
                          </div>
                          <p className="text-xs text-white/30 mb-2">{tmpl.description}</p>
                          {tmpl.tracks > 0 && (
                            <div className="flex items-center gap-3 text-[10px] text-white/20">
                              <span>{tmpl.tracks} tracks</span>
                              <span>{tmpl.fields} fields</span>
                            </div>
                          )}
                        </div>
                        {selectedTemplate === tmpl.id && (
                          <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                            <Check size={12} className="text-blue-400" />
                          </div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={prev}
            className={`kea-btn-secondary text-sm flex items-center gap-2 ${
              currentStep === 0 ? 'opacity-0 pointer-events-none' : ''
            }`}
          >
            <ArrowLeft size={14} /> Back
          </button>

          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === currentStep ? 'bg-blue-400 w-4' : i < currentStep ? 'bg-emerald-400' : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <button onClick={next} className="kea-btn-primary text-sm flex items-center gap-2">
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button className="kea-btn-primary text-sm flex items-center gap-2">
              <Sparkles size={14} /> Launch KEA
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
