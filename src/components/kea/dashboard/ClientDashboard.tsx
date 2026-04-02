'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/kea/stores/auth-store';
import { useT } from '@/lib/kea/i18n';

interface TrackProgress {
  id: string;
  name: string;
  code: string;
  totalFields: number;
  filledFields: number;
  completion: number;
  blockCount: number;
  sessions: number;
}

function ProgressRing({ percentage, label, size = 160 }: { percentage: number; label: string; size?: number }) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color =
    percentage < 34 ? '#EF4444' : percentage < 67 ? '#F59E0B' : percentage < 100 ? '#3B82F6' : '#10B981';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white">{percentage}%</span>
        <span className="text-[11px] text-white/30 mt-1">{label}</span>
      </div>
    </div>
  );
}

export function ClientDashboard() {
  const user = useAuthStore((s) => s.user);
  const organization = useAuthStore((s) => s.organization);
  const tt = useT();

  const [globalCompletion, setGlobalCompletion] = useState(0);
  const [totalFields, setTotalFields] = useState(0);
  const [filledFields, setFilledFields] = useState(0);
  const [tracks, setTracks] = useState<TrackProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greetingKey = hour < 12 ? 'dash.greeting.morning' : hour < 18 ? 'dash.greeting.afternoon' : 'dash.greeting.evening';
  const firstName = user?.full_name?.split(' ')[0] || '';

  // Estimate: ~2 min per unfilled field of conversation
  const remainingFields = totalFields - filledFields;
  const estimatedMinutes = remainingFields * 2;
  const estimatedHours = Math.floor(estimatedMinutes / 60);
  const estimatedMins = estimatedMinutes % 60;

  useEffect(() => {
    if (!organization?.id) return;

    const load = async () => {
      const res = await fetch(`/api/kea/client-progress?organizationId=${organization.id}`);
      const data = await res.json();

      if (!data.error) {
        setGlobalCompletion(data.globalCompletion || 0);
        setTotalFields(data.totalFields || 0);
        setFilledFields(data.filledFields || 0);
        setTracks(data.tracks || []);
      }

      setLoading(false);
    };

    load();
  }, [organization?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto flex flex-col items-center min-h-[calc(100vh-56px-48px)] py-8 px-4">

      {/* Top Chat Button */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full mb-8"
      >
        <Link href="/kea/chat">
          <div className="kea-card kea-glow-border p-4 flex items-center justify-between hover:border-blue-500/30 transition-all group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                <MessageSquare size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{tt('client.startNewSession')}</p>
                <p className="text-[11px] text-white/30">{tt('onboarding.chat.subtitle')}</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-white/20 group-hover:text-blue-400 transition-colors" />
          </div>
        </Link>
      </motion.div>

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="text-center mb-6"
      >
        <h1 className="text-xl font-bold text-white">
          {tt(greetingKey as 'dash.greeting.morning')}, {firstName}
        </h1>
      </motion.div>

      {/* Big Progress Ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <ProgressRing percentage={globalCompletion} label={tt('client.completed')} />
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-6 mb-8"
      >
        <div className="text-center">
          <p className="text-lg font-bold text-white">{filledFields}</p>
          <p className="text-[10px] text-white/25 uppercase">{tt('client.fields')}</p>
        </div>
        <div className="w-px h-8 bg-white/[0.06]" />
        <div className="text-center">
          <p className="text-lg font-bold text-white">{totalFields - filledFields}</p>
          <p className="text-[10px] text-white/25 uppercase">{tt('client.remaining')}</p>
        </div>
        <div className="w-px h-8 bg-white/[0.06]" />
        <div className="text-center">
          <p className="text-lg font-bold text-white flex items-center gap-1">
            <Clock size={14} className="text-white/40" />
            {estimatedHours > 0 ? `${estimatedHours}h ${estimatedMins}m` : `${estimatedMins}m`}
          </p>
          <p className="text-[10px] text-white/25 uppercase">{tt('client.estimated')}</p>
        </div>
      </motion.div>

      {/* Track bars */}
      {tracks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full space-y-3 mb-8"
        >
          {tracks.map((track, i) => {
            const color =
              track.completion < 34 ? 'bg-red-400' : track.completion < 67 ? 'bg-amber-400' : track.completion < 100 ? 'bg-blue-400' : 'bg-emerald-400';

            return (
              <motion.div
                key={track.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                className="kea-card px-4 py-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-white/60">{track.name}</span>
                  <span className="text-xs font-bold text-white">{track.completion}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${track.completion}%` }}
                    transition={{ duration: 1, delay: 0.4 + i * 0.05, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Bottom Chat Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full mt-auto"
      >
        <Link href="/kea/chat">
          <div className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center gap-3 cursor-pointer">
            <MessageSquare size={20} className="text-white" />
            <span className="text-sm font-semibold text-white">{tt('client.startNewSession')}</span>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
