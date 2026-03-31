'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Bell,
  Check,
  X,
  Eye,
  Filter,
  Clock,
  Loader2,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/kea/stores/auth-store';
import { supabase } from '@/lib/kea/supabase-client';
import type { Alert, AlertSeverity, AlertStatus } from '@/types/database';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

const severityConfig: Record<AlertSeverity, { color: string; bgClass: string; borderClass: string; icon: React.ElementType; badgeClass: string }> = {
  critical: { color: 'text-red-400', bgClass: 'bg-red-500/10', borderClass: 'border-red-500/20', icon: AlertCircle, badgeClass: 'kea-badge-red' },
  high: { color: 'text-amber-400', bgClass: 'bg-amber-500/10', borderClass: 'border-amber-500/20', icon: AlertTriangle, badgeClass: 'kea-badge-amber' },
  medium: { color: 'text-blue-400', bgClass: 'bg-blue-500/10', borderClass: 'border-blue-500/20', icon: Info, badgeClass: 'kea-badge-blue' },
  low: { color: 'text-white/40', bgClass: 'bg-white/[0.04]', borderClass: 'border-white/[0.08]', icon: Bell, badgeClass: 'kea-badge kea-badge-gray' },
};

const statusOptions: AlertStatus[] = ['open', 'acknowledged', 'resolved', 'dismissed'];

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AlertsPage() {
  const { organization } = useAuthStore();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');

  const fetchAlerts = useCallback(async () => {
    if (!organization) return;
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('organization_id', organization.id)
      .order('created_at', { ascending: false });
    if (!error && data) {
      setAlerts(data as unknown as Alert[]);
    }
    setLoading(false);
  }, [organization]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  async function updateAlertStatus(alertId: string, newStatus: AlertStatus) {
    const { error } = await supabase
      .from('alerts')
      .update({ status: newStatus, ...(newStatus === 'resolved' ? { resolved_at: new Date().toISOString() } : {}) })
      .eq('id', alertId);
    if (!error) {
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, status: newStatus } : a)));
    }
  }

  async function acknowledgeAllOpen() {
    if (!organization) return;
    const openIds = alerts.filter((a) => a.status === 'open').map((a) => a.id);
    if (openIds.length === 0) return;
    const { error } = await supabase
      .from('alerts')
      .update({ status: 'acknowledged' as AlertStatus })
      .in('id', openIds);
    if (!error) {
      setAlerts((prev) => prev.map((a) => (a.status === 'open' ? { ...a, status: 'acknowledged' as AlertStatus } : a)));
    }
  }

  const filtered = alerts.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    return true;
  });

  const openCount = alerts.filter((a) => a.status === 'open').length;
  const criticalCount = alerts.filter((a) => a.severity === 'critical' && a.status === 'open').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${criticalCount > 0 ? 'bg-red-500/10 border border-red-500/15' : 'bg-blue-500/10 border border-blue-500/15'} flex items-center justify-center`}>
            <AlertTriangle size={18} className={criticalCount > 0 ? 'text-red-400' : 'text-blue-400'} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Alerts</h2>
            <p className="text-xs text-white/30">
              {openCount} open &middot; {criticalCount} critical
            </p>
          </div>
        </div>
        <button
          onClick={acknowledgeAllOpen}
          className="kea-btn-secondary text-sm flex items-center gap-2"
        >
          <Check size={14} /> Acknowledge All Open
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-4 items-center"
      >
        <div className="flex items-center gap-2">
          <Filter size={12} className="text-white/25" />
          <span className="text-xs text-white/30">Status:</span>
          {(['all', ...statusOptions] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all capitalize ${
                statusFilter === s
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                  : 'bg-white/[0.03] text-white/30 border border-white/[0.06] hover:bg-white/[0.06]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/30">Severity:</span>
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all capitalize ${
                severityFilter === s
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                  : 'bg-white/[0.03] text-white/30 border border-white/[0.06] hover:bg-white/[0.06]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Alert list */}
      <div className="space-y-3">
        {filtered.map((alert, i) => {
          const cfg = severityConfig[alert.severity];
          const SeverityIcon = cfg.icon;

          return (
            <motion.div
              key={alert.id}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className={`kea-card p-5 border-l-2 ${
                alert.severity === 'critical'
                  ? 'border-l-red-400'
                  : alert.severity === 'high'
                    ? 'border-l-amber-400'
                    : alert.severity === 'medium'
                      ? 'border-l-blue-400'
                      : 'border-l-white/10'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-9 h-9 rounded-xl ${cfg.bgClass} border ${cfg.borderClass} flex items-center justify-center shrink-0`}>
                  <SeverityIcon size={16} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="text-sm font-semibold text-white/80">{alert.title}</h4>
                    <span className={`kea-badge ${cfg.badgeClass}`}>
                      {alert.severity}
                    </span>
                    <span
                      className={`kea-badge ${
                        alert.status === 'open'
                          ? 'kea-badge-red'
                          : alert.status === 'acknowledged'
                            ? 'kea-badge-amber'
                            : alert.status === 'resolved'
                              ? 'kea-badge-green'
                              : 'kea-badge-blue'
                      }`}
                    >
                      {alert.status}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 mb-2">{alert.description}</p>
                  <div className="flex items-center gap-4 text-[10px] text-white/20">
                    <span className="flex items-center gap-1">
                      <Clock size={9} /> {timeAgo(alert.created_at)}
                    </span>
                    <span>Type: {alert.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {alert.status === 'open' && (
                    <button
                      onClick={() => updateAlertStatus(alert.id, 'acknowledged')}
                      className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center hover:bg-amber-500/20 transition-colors"
                      title="Acknowledge"
                    >
                      <Eye size={13} className="text-amber-400" />
                    </button>
                  )}
                  {(alert.status === 'open' || alert.status === 'acknowledged') && (
                    <button
                      onClick={() => updateAlertStatus(alert.id, 'resolved')}
                      className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/20 transition-colors"
                      title="Resolve"
                    >
                      <Check size={13} className="text-emerald-400" />
                    </button>
                  )}
                  {alert.status !== 'dismissed' && (
                    <button
                      onClick={() => updateAlertStatus(alert.id, 'dismissed')}
                      className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
                      title="Dismiss"
                    >
                      <X size={13} className="text-white/30" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="kea-card p-12 flex flex-col items-center justify-center"
          >
            <Check size={32} className="text-emerald-400/30 mb-3" />
            <p className="text-sm text-white/30">
              {alerts.length === 0 ? 'No alerts yet' : 'No alerts match your filters'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
