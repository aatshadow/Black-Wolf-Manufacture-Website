'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Database,
  AlertTriangle,
  Users,
  Clock,
  Zap,
  ArrowRight,
  Sparkles,
  FileText,
  Activity,
  Shield,
  Settings,
  Download,
  LayoutGrid,
  Rocket,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/kea/stores/auth-store';
import { supabase } from '@/lib/kea/supabase-client';

interface TrackWithStats {
  id: string;
  name: string;
  code: string;
  conversation_style: string;
  sessions: number;
  completion: number;
  lastActive: string;
  blockCount: number;
}

interface ActivityItem {
  action: string;
  detail: string;
  time: string;
  icon: React.ElementType;
}

function ProgressRing({ percentage, size = 80 }: { percentage: number; size?: number }) {
  const strokeWidth = 6;
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
        <span className="text-lg font-bold text-white">{percentage}%</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const organization = useAuthStore((s) => s.organization);
  const user = useAuthStore((s) => s.user);
  const [dataPoints, setDataPoints] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [tracks, setTracks] = useState<TrackWithStats[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [globalCompletion, setGlobalCompletion] = useState(0);
  const [templateCount, setTemplateCount] = useState(0);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!organization?.id) return;
      const orgId = organization.id;

      // Parallel queries
      const [
        { count: sessCount },
        { count: alertCt },
        { count: userCt },
        { data: instances },
        { data: templates },
      ] = await Promise.all([
        supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
        supabase.from('alerts').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'open'),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
        supabase.from('extraction_instances').select('data').eq('organization_id', orgId),
        supabase.from('templates').select('id').eq('organization_id', orgId),
      ]);

      setSessionCount(sessCount || 0);
      setAlertCount(alertCt || 0);
      setUserCount(userCt || 0);
      setTemplateCount(templates?.length || 0);

      let totalDataPoints = 0;
      if (instances) {
        for (const inst of instances) {
          const data = inst.data as Record<string, unknown> | null;
          if (data) totalDataPoints += Object.values(data).filter((v) => v != null).length;
        }
      }
      setDataPoints(totalDataPoints);

      // Load tracks
      if (templates?.length) {
        const templateIds = templates.map((t) => t.id);
        const { data: trackData } = await supabase
          .from('tracks')
          .select('id, name, code, conversation_style')
          .in('template_id', templateIds)
          .order('display_order');

        if (trackData) {
          const trackStats: TrackWithStats[] = [];
          let totalCompletion = 0;

          for (const track of trackData) {
            const [{ count }, { data: lastSess }, { data: progress }, { count: blockCount }] = await Promise.all([
              supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('track_id', track.id),
              supabase.from('sessions').select('created_at').eq('track_id', track.id).order('created_at', { ascending: false }).limit(1),
              supabase.from('progress_snapshots').select('completeness_pct').eq('track_id', track.id).is('block_id', null).order('snapshot_date', { ascending: false }).limit(1),
              supabase.from('schema_blocks').select('*', { count: 'exact', head: true }).eq('track_id', track.id),
            ]);

            const completion = progress?.[0]?.completeness_pct || 0;
            totalCompletion += completion;

            const lastDate = lastSess?.[0]?.created_at;
            let lastActive = 'Never';
            if (lastDate) {
              const diff = Date.now() - new Date(lastDate).getTime();
              const mins = Math.floor(diff / 60000);
              if (mins < 60) lastActive = `${mins}m ago`;
              else if (mins < 1440) lastActive = `${Math.floor(mins / 60)}h ago`;
              else lastActive = `${Math.floor(mins / 1440)}d ago`;
            }

            trackStats.push({
              id: track.id,
              name: track.name,
              code: track.code,
              conversation_style: track.conversation_style,
              sessions: count || 0,
              completion,
              lastActive,
              blockCount: blockCount || 0,
            });
          }

          setTracks(trackStats);
          setGlobalCompletion(trackStats.length ? Math.round(totalCompletion / trackStats.length) : 0);
        }
      }

      // Recent activity
      const activityItems: ActivityItem[] = [];
      const { data: recentExtractions } = await supabase
        .from('extraction_history')
        .select('field_code, new_value, created_at, instance:extraction_instances(instance_label)')
        .eq('source', 'bot_extracted')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentExtractions) {
        for (const ext of recentExtractions) {
          const inst = ext.instance as unknown as { instance_label: string } | null;
          const diff = Date.now() - new Date(ext.created_at).getTime();
          const mins = Math.floor(diff / 60000);
          const timeStr = mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.floor(mins / 60)}h ago` : `${Math.floor(mins / 1440)}d ago`;
          activityItems.push({ action: 'Data extracted', detail: `${inst?.instance_label || ''} — ${ext.field_code}`, time: timeStr, icon: Zap });
        }
      }

      const { data: recentSessions } = await supabase
        .from('sessions')
        .select('status, created_at, track:tracks(name, code)')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentSessions) {
        for (const sess of recentSessions) {
          const track = sess.track as unknown as { name: string; code: string } | null;
          const diff = Date.now() - new Date(sess.created_at).getTime();
          const mins = Math.floor(diff / 60000);
          const timeStr = mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.floor(mins / 60)}h ago` : `${Math.floor(mins / 1440)}d ago`;
          activityItems.push({
            action: sess.status === 'completed' ? 'Session completed' : 'Session started',
            detail: `${track?.name || 'Session'}`,
            time: timeStr,
            icon: sess.status === 'completed' ? MessageSquare : Clock,
          });
        }
      }

      setActivities(activityItems.slice(0, 8));
    };

    loadDashboard();
  }, [organization?.id]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const shortcuts = [
    { label: 'Start Chat', desc: 'Begin extraction session', href: '/kea/chat', icon: MessageSquare, color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/20', iconColor: 'text-blue-400' },
    { label: 'Schemas', desc: 'Create & manage templates', href: '/kea/dashboard/schemas', icon: Sparkles, color: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/20', iconColor: 'text-purple-400' },
    { label: 'Monitor', desc: 'Live session tracking', href: '/kea/dashboard/monitor', icon: Activity, color: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/20', iconColor: 'text-emerald-400' },
    { label: 'Export', desc: 'Download & deploy data', href: '/kea/dashboard/export', icon: Download, color: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/20', iconColor: 'text-amber-400' },
    { label: 'Users', desc: 'Manage team members', href: '/kea/dashboard/users', icon: Users, color: 'from-cyan-500/20 to-cyan-600/10', border: 'border-cyan-500/20', iconColor: 'text-cyan-400' },
    { label: 'Alerts', desc: 'Review contradictions', href: '/kea/dashboard/alerts', icon: AlertTriangle, color: 'from-red-500/20 to-red-600/10', border: 'border-red-500/20', iconColor: 'text-red-400' },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* ═══ WELCOME HEADER ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold text-white">
            {greeting}, {user?.full_name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-sm text-white/30 mt-0.5">
            {organization?.name} &middot; KEA Knowledge Extraction
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/kea/chat" className="kea-btn-primary text-sm flex items-center gap-2">
            <MessageSquare size={14} />
            Start Session
          </Link>
        </div>
      </motion.div>

      {/* ═══ QUICK ACCESS WIDGETS (iPad-style grid) ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {shortcuts.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={item.href}>
              <div className="kea-card kea-card-interactive p-4 text-center group h-full">
                <div className={`w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br ${item.color} border ${item.border} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <item.icon size={20} className={item.iconColor} />
                </div>
                <p className="text-sm font-semibold text-white/80">{item.label}</p>
                <p className="text-[10px] text-white/25 mt-0.5">{item.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ═══ STATS ROW ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Global Progress', value: `${globalCompletion}%`, color: globalCompletion > 66 ? 'text-emerald-400' : globalCompletion > 33 ? 'text-amber-400' : 'text-red-400' },
          { label: 'Data Points', value: dataPoints.toLocaleString(), color: 'text-blue-400' },
          { label: 'Sessions', value: sessionCount.toString(), color: 'text-purple-400' },
          { label: 'Open Alerts', value: alertCount.toString(), color: alertCount > 0 ? 'text-red-400' : 'text-emerald-400' },
          { label: 'Team Members', value: userCount.toString(), color: 'text-cyan-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            className="kea-card p-4"
          >
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-white/30 mt-1 uppercase tracking-wider">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ═══ MAIN GRID: Tracks + Progress + Activity ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Left: Track Progress Cards (span 5) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
              Extraction Tracks
            </h3>
            <Link href="/kea/chat" className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ArrowRight size={10} />
            </Link>
          </div>

          {tracks.length === 0 ? (
            <div className="kea-card p-8 text-center">
              <LayoutGrid size={24} className="text-white/10 mx-auto mb-2" />
              <p className="text-sm text-white/30">No tracks yet</p>
              <p className="text-xs text-white/15 mt-1">Create a template in Schemas to get started</p>
            </div>
          ) : (
            tracks.map((track, i) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <Link href="/kea/chat">
                  <div className="kea-card kea-card-interactive p-4">
                    <div className="flex items-center gap-4">
                      <ProgressRing percentage={track.completion} size={56} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-white truncate">{track.name}</h4>
                          <span className={`kea-badge text-[9px] ${track.conversation_style === 'open_ended' ? 'kea-badge-blue' : 'kea-badge-green'}`}>
                            {track.conversation_style === 'open_ended' ? 'Open' : 'Guided'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-white/30">
                          <span>{track.sessions} sessions</span>
                          <span>{track.blockCount} blocks</span>
                          <span>{track.lastActive}</span>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${track.completion}%` }}
                            transition={{ duration: 1, delay: 0.6 + i * 0.1 }}
                          />
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-white/15 shrink-0" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Center: Global Progress Ring (span 3) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-3"
        >
          <div className="kea-card p-6 flex flex-col items-center h-full">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4 self-start">
              Discovery Progress
            </h3>
            <div className="flex-1 flex items-center justify-center">
              <ProgressRing percentage={globalCompletion} size={140} />
            </div>
            <div className="w-full space-y-2 mt-4">
              {tracks.map((track) => (
                <div key={track.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${track.conversation_style === 'open_ended' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
                    <span className="text-white/40 truncate max-w-[120px]">{track.name}</span>
                  </div>
                  <span className="text-white/60 font-semibold">{track.completion}%</span>
                </div>
              ))}
            </div>

            {/* Quick info */}
            <div className="w-full mt-4 pt-4 border-t border-white/[0.04] grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-white">{templateCount}</p>
                <p className="text-[10px] text-white/25">Templates</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">{tracks.length}</p>
                <p className="text-[10px] text-white/25">Tracks</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Activity Feed (span 4) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-4"
        >
          <div className="kea-card p-5 h-full flex flex-col">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
              Recent Activity
            </h3>
            <div className="flex-1 space-y-1 overflow-y-auto">
              {activities.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-8">
                  <p className="text-sm text-white/20">No activity yet</p>
                </div>
              ) : (
                activities.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.05 }}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                        <Icon size={12} className="text-white/40" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-white/60 font-medium">{item.action}</p>
                        <p className="text-[11px] text-white/25 truncate">{item.detail}</p>
                      </div>
                      <span className="text-[10px] text-white/15 shrink-0 mt-0.5">{item.time}</span>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ═══ BOTTOM ROW: Quick Actions ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Link href="/kea/dashboard/export">
            <div className="kea-card kea-card-interactive p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-600/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Rocket size={18} className="text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Deploy to Central</p>
                <p className="text-[11px] text-white/25">Push extracted data to Blackwolf CRM</p>
              </div>
              <ArrowRight size={14} className="text-white/15" />
            </div>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}>
          <Link href="/kea/dashboard/schemas">
            <div className="kea-card kea-card-interactive p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <FileText size={18} className="text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Create Template</p>
                <p className="text-[11px] text-white/25">Design extraction schemas with AI</p>
              </div>
              <ArrowRight size={14} className="text-white/15" />
            </div>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
          <Link href="/kea/dashboard/settings">
            <div className="kea-card kea-card-interactive p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/[0.08] flex items-center justify-center shrink-0">
                <Settings size={18} className="text-white/40" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Settings</p>
                <p className="text-[11px] text-white/25">Organization & preferences</p>
              </div>
              <ArrowRight size={14} className="text-white/15" />
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
