'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  MessageSquare,
  Layers,
  BarChart3,
  Rocket,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useAuthStore } from '@/lib/kea/stores/auth-store';
import { useKeaLang, localeConfig, useT, type KeaLocale, type TranslationKey } from '@/lib/kea/i18n';
import { supabase } from '@/lib/kea/supabase-client';

const locales: KeaLocale[] = ['en', 'bg', 'es'];

const steps: {
  key: string;
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
  bodyKey: TranslationKey;
  icon: typeof Sparkles;
  color: string;
  border: string;
  iconColor: string;
  visual: React.ReactNode;
}[] = [
  {
    key: 'welcome',
    titleKey: 'onboarding.welcome.title',
    subtitleKey: 'onboarding.welcome.subtitle',
    bodyKey: 'onboarding.welcome.body',
    icon: Sparkles,
    color: 'from-blue-500/30 to-blue-600/10',
    border: 'border-blue-500/20',
    iconColor: 'text-blue-400',
    visual: (
      <div className="grid grid-cols-3 gap-3 mt-4">
        {['Extract', 'Organize', 'Validate'].map((w, i) => (
          <div key={w} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
            <div className={`w-8 h-8 mx-auto rounded-lg mb-2 flex items-center justify-center ${
              i === 0 ? 'bg-blue-500/15 text-blue-400' : i === 1 ? 'bg-purple-500/15 text-purple-400' : 'bg-emerald-500/15 text-emerald-400'
            }`}>
              <span className="text-sm font-bold">{i + 1}</span>
            </div>
            <p className="text-xs font-medium text-white/50">{w}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    key: 'chat',
    titleKey: 'onboarding.chat.title',
    subtitleKey: 'onboarding.chat.subtitle',
    bodyKey: 'onboarding.chat.body',
    icon: MessageSquare,
    color: 'from-emerald-500/30 to-emerald-600/10',
    border: 'border-emerald-500/20',
    iconColor: 'text-emerald-400',
    visual: (
      <div className="mt-4 space-y-2">
        <div className="flex gap-2 items-start">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[10px] text-emerald-400 font-bold">AI</span>
          </div>
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3 text-xs text-white/40 max-w-[80%]">
            How many production lines does your factory operate?
          </div>
        </div>
        <div className="flex gap-2 items-start justify-end">
          <div className="rounded-xl bg-blue-500/10 border border-blue-500/15 p-3 text-xs text-blue-300/70 max-w-[80%]">
            We currently have 3 main production lines and 1 for prototyping.
          </div>
        </div>
        <div className="flex items-center gap-2 ml-8">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400/50">Extracting data...</span>
        </div>
      </div>
    ),
  },
  {
    key: 'tracks',
    titleKey: 'onboarding.tracks.title',
    subtitleKey: 'onboarding.tracks.subtitle',
    bodyKey: 'onboarding.tracks.body',
    icon: Layers,
    color: 'from-purple-500/30 to-purple-600/10',
    border: 'border-purple-500/20',
    iconColor: 'text-purple-400',
    visual: (
      <div className="mt-4 space-y-2">
        {[
          { name: 'Operations', blocks: 12, pct: 45, color: 'bg-blue-400' },
          { name: 'Finance', blocks: 8, pct: 20, color: 'bg-purple-400' },
          { name: 'HR & People', blocks: 6, pct: 0, color: 'bg-amber-400' },
        ].map((track) => (
          <div key={track.name} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-white/60">{track.name}</span>
              <span className="text-[10px] text-white/25">{track.blocks} blocks</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
              <div className={`h-full rounded-full ${track.color}`} style={{ width: `${track.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    key: 'progress',
    titleKey: 'onboarding.progress.title',
    subtitleKey: 'onboarding.progress.subtitle',
    bodyKey: 'onboarding.progress.body',
    icon: BarChart3,
    color: 'from-amber-500/30 to-amber-600/10',
    border: 'border-amber-500/20',
    iconColor: 'text-amber-400',
    visual: (
      <div className="mt-4 flex items-center justify-center">
        <div className="relative w-28 h-28">
          <svg width={112} height={112} className="-rotate-90">
            <circle cx={56} cy={56} r={48} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={6} />
            <circle
              cx={56} cy={56} r={48} fill="none" stroke="#3B82F6" strokeWidth={6} strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 48}
              strokeDashoffset={2 * Math.PI * 48 * 0.68}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-white">32%</span>
            <span className="text-[9px] text-white/25 uppercase tracking-wider">Complete</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    key: 'ready',
    titleKey: 'onboarding.ready.title',
    subtitleKey: 'onboarding.ready.subtitle',
    bodyKey: 'onboarding.ready.body',
    icon: Rocket,
    color: 'from-cyan-500/30 to-cyan-600/10',
    border: 'border-cyan-500/20',
    iconColor: 'text-cyan-400',
    visual: null,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const user = useAuthStore((s) => s.user);
  const { locale, setLocale } = useKeaLang();
  const t = useT();

  const step = steps[current];

  const finish = async () => {
    if (user) {
      // Mark onboarding complete by setting last_session_at + language
      await supabase
        .from('user_profiles')
        .update({
          language: locale,
          last_session_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    }
    window.location.href = '/kea/dashboard';
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-[520px]"
      >
        {/* Language selector at top */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => setLocale(loc)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  locale === loc
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                    : 'text-white/35 hover:text-white/60'
                }`}
              >
                <span>{localeConfig[loc].flag}</span>
                <span>{localeConfig[loc].short}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step card */}
        <div className="kea-card kea-glow-border p-8 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.key}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
            >
              {/* Icon */}
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} border ${step.border} flex items-center justify-center shrink-0`}>
                  <step.icon size={22} className={step.iconColor} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{t(step.titleKey)}</h2>
                  <p className="text-xs text-white/30">{t(step.subtitleKey)}</p>
                </div>
              </div>

              {/* Body */}
              <p className="text-sm text-white/50 leading-relaxed">
                {t(step.bodyKey)}
              </p>

              {/* Visual */}
              {step.visual}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          {current > 0 ? (
            <button
              onClick={() => setCurrent(current - 1)}
              className="kea-btn-secondary text-sm flex items-center gap-2"
            >
              <ArrowLeft size={14} /> {t('onboarding.back')}
            </button>
          ) : (
            <button
              onClick={finish}
              className="text-sm text-white/20 hover:text-white/40 transition-colors"
            >
              {t('onboarding.skip')}
            </button>
          )}

          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? 'bg-blue-400 w-5' : i < current ? 'bg-blue-400/40 w-1.5' : 'bg-white/10 w-1.5'
                }`}
              />
            ))}
          </div>

          {current < steps.length - 1 ? (
            <button
              onClick={() => setCurrent(current + 1)}
              className="kea-btn-primary text-sm flex items-center gap-2"
            >
              {t('onboarding.next')} <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={finish}
              className="kea-btn-primary text-sm flex items-center gap-2"
            >
              <Rocket size={14} /> {t('onboarding.getStarted')}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
