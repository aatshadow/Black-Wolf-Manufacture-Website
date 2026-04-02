'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Users,
  Clock,
  Zap,
  ArrowRight,
  Building2,
  Plus,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/kea/stores/auth-store';
import { useT } from '@/lib/kea/i18n';
import { ClientDashboard } from '@/components/kea/dashboard/ClientDashboard';

interface ClientSummary {
  id: string;
  name: string;
  slug: string;
  status: string;
  globalCompletion: number;
  sessions: number;
  users: number;
  totalFields: number;
  filledFields: number;
  lastActivity: string | null;
}

interface ActivityItem {
  action: string;
  detail: string;
  time: string;
  icon: React.ElementType;
}

function ProgressRing({ percentage, size = 48 }: { percentage: number; size?: number }) {
  const strokeWidth = 4;
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
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white">{percentage}%</span>
      </div>
    </div>
  );
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const t = useT();
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') return;

    const load = async () => {
      // Fetch all orgs
      const res = await fetch('/api/kea/admin-data');
      const data = await res.json();
      const orgs = data.organizations || [];

      // For each org, get progress
      const summaries: ClientSummary[] = [];
      const allActivities: ActivityItem[] = [];

      await Promise.all(
        orgs.map(async (org: { id: string; name: string; slug: string; status: string }) => {
          const [progressRes, usersRes] = await Promise.all([
            fetch(`/api/kea/client-progress?organizationId=${org.id}`),
            fetch(`/api/kea/admin-data?usersForOrg=${org.id}`),
          ]);
          const progress = await progressRes.json();
          const usersData = await usersRes.json();

          summaries.push({
            id: org.id,
            name: org.name,
            slug: org.slug,
            status: org.status,
            globalCompletion: progress.globalCompletion || 0,
            sessions: progress.sessions || 0,
            users: (usersData.users || []).length,
            totalFields: progress.totalFields || 0,
            filledFields: progress.filledFields || 0,
            lastActivity: progress.lastActivity,
          });

          // Collect activity from this org
          if (progress.lastActivity) {
            allActivities.push({
              action: 'Session activity',
              detail: org.name,
              time: timeAgo(progress.lastActivity),
              icon: MessageSquare,
            });
          }
        })
      );

      setClients(summaries);
      setActivities(allActivities.slice(0, 6));
      setLoading(false);
    };

    load();
  }, [user?.role]);

  // Client users get the simplified dashboard
  if (user?.role !== 'admin') {
    return <ClientDashboard />;
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return t('dash.greeting.morning');
    if (h < 18) return t('dash.greeting.afternoon');
    return t('dash.greeting.evening');
  })();

  const totalSessions = clients.reduce((s, c) => s + c.sessions, 0);
  const totalUsers = clients.reduce((s, c) => s + c.users, 0);
  const avgCompletion = clients.length
    ? Math.round(clients.reduce((s, c) => s + c.globalCompletion, 0) / clients.length)
    : 0;

  return (
    <div className="space-y-6 max-w-[1200px]">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold text-white">
            {greeting}, {user?.full_name?.split(' ')[0] || 'Admin'}
          </h1>
          <p className="text-sm text-white/30 mt-0.5">KEA Admin Panel</p>
        </div>
        <Link href="/kea/dashboard/clients" className="kea-btn-primary text-sm flex items-center gap-2">
          <Plus size={14} />
          {t('nav.clients')}
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t('nav.clients'), value: clients.length.toString(), icon: Building2, color: 'text-blue-400' },
          { label: t('dash.globalProgress'), value: `${avgCompletion}%`, icon: BarChart3, color: avgCompletion > 66 ? 'text-emerald-400' : avgCompletion > 33 ? 'text-amber-400' : 'text-red-400' },
          { label: t('dash.sessions'), value: totalSessions.toString(), icon: MessageSquare, color: 'text-purple-400' },
          { label: t('dash.teamMembers'), value: totalUsers.toString(), icon: Users, color: 'text-cyan-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="kea-card p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
              <stat.icon size={18} className={stat.color} />
            </div>
            <div>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-white/25 uppercase tracking-wider">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Client Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">{t('nav.clients')}</h2>
          <Link href="/kea/dashboard/clients" className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1">
            Manage <ArrowRight size={10} />
          </Link>
        </div>

        {loading ? (
          <div className="kea-card p-12 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
          </div>
        ) : clients.length === 0 ? (
          <div className="kea-card p-8 text-center">
            <Building2 size={24} className="text-white/10 mx-auto mb-2" />
            <p className="text-sm text-white/30">No clients yet</p>
            <Link href="/kea/dashboard/clients" className="text-xs text-blue-400 hover:underline mt-1 inline-block">
              Create your first client
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((client, i) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <Link href="/kea/dashboard/clients">
                  <div className="kea-card kea-card-interactive p-4">
                    <div className="flex items-center gap-4">
                      <ProgressRing percentage={client.globalCompletion} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-white truncate">{client.name}</h3>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                            client.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/[0.06] text-white/30'
                          }`}>
                            {client.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-white/30">
                          <span className="flex items-center gap-1"><Users size={10} /> {client.users} users</span>
                          <span className="flex items-center gap-1"><MessageSquare size={10} /> {client.sessions} sessions</span>
                          <span className="flex items-center gap-1"><Zap size={10} /> {client.filledFields}/{client.totalFields} fields</span>
                          <span className="flex items-center gap-1"><Clock size={10} /> {timeAgo(client.lastActivity)}</span>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${client.globalCompletion}%` }}
                            transition={{ duration: 1, delay: 0.3 + i * 0.05 }}
                          />
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-white/15 shrink-0" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: t('dash.createTemplate'), desc: t('dash.createTemplate.desc'), href: '/kea/dashboard/schemas', icon: Zap, color: 'text-purple-400', bg: 'from-purple-500/15 to-purple-600/5', border: 'border-purple-500/15' },
          { label: t('dash.export'), desc: t('dash.export.desc'), href: '/kea/dashboard/export', icon: BarChart3, color: 'text-emerald-400', bg: 'from-emerald-500/15 to-emerald-600/5', border: 'border-emerald-500/15' },
          { label: t('nav.clients'), desc: 'Add clients & users', href: '/kea/dashboard/clients', icon: Building2, color: 'text-blue-400', bg: 'from-blue-500/15 to-blue-600/5', border: 'border-blue-500/15' },
        ].map((action, i) => (
          <motion.div key={action.href} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.05 }}>
            <Link href={action.href}>
              <div className="kea-card kea-card-interactive p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.bg} border ${action.border} flex items-center justify-center shrink-0`}>
                  <action.icon size={16} className={action.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{action.label}</p>
                  <p className="text-[10px] text-white/25">{action.desc}</p>
                </div>
                <ArrowRight size={12} className="text-white/15" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
