'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  ArrowRight,
  Clock,
  Factory,
  Briefcase,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/lib/kea/stores/auth-store';
import { useKeaLang, useT } from '@/lib/kea/i18n';

interface TrackData {
  id: string;
  name: string;
  code: string;
  description: string | null;
  conversation_style: string;
}

interface TrackStats {
  sessions: number;
  completion: number;
}

interface SessionData {
  id: string;
  status: string;
  summary: string | null;
  created_at: string;
  track_id: string;
  trackName?: string;
  trackCode?: string;
}

export default function ChatHubPage() {
  const [tracks, setTracks] = useState<TrackData[]>([]);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [trackStats, setTrackStats] = useState<Record<string, TrackStats>>({});
  const [creating, setCreating] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const organization = useAuthStore((s) => s.organization);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const locale = useKeaLang((s) => s.locale);
  const t = useT();

  // Load tracks, sessions, and stats via API
  useEffect(() => {
    if (!organization?.id) return;

    const load = async () => {
      try {
        const res = await fetch(`/api/kea/chat-data?organizationId=${organization.id}`);
        const data = await res.json();

        if (data.tracks) setTracks(data.tracks);
        if (data.sessions) setSessions(data.sessions);
        if (data.trackStats) setTrackStats(data.trackStats);
      } catch (err) {
        console.error('Failed to load chat data:', err);
      }
      setLoading(false);
    };

    load();
  }, [organization?.id]);

  const startSession = async (trackId: string) => {
    if (!user?.id || !organization?.id || creating) return;
    setCreating(trackId);

    try {
      const response = await fetch('/api/kea/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackId,
          message: '__START_SESSION__',
          organizationId: organization.id,
          userId: user.id,
          language: locale,
        }),
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let newSessionId = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.sessionId) newSessionId = data.sessionId;
          } catch { /* skip */ }
        }
      }

      if (buffer.trim().startsWith('data: ')) {
        try {
          const data = JSON.parse(buffer.trim().slice(6));
          if (data.sessionId) newSessionId = data.sessionId;
        } catch { /* ignore */ }
      }

      if (newSessionId) {
        router.push(`/kea/chat/${newSessionId}`);
      }
    } catch (err) {
      console.error('Failed to create session:', err);
    } finally {
      setCreating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Track selection */}
      <div>
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
          {t('chat.pickTrack')}
        </h3>
        {tracks.length === 0 ? (
          <div className="kea-card p-8 text-center">
            {user?.role === 'admin' ? (
              <>
                <p className="text-sm text-white/40 mb-2">{t('dash.noTracks')}</p>
                <Link href="/kea/dashboard/schemas" className="text-xs text-blue-400 hover:underline">
                  {t('dash.noTracks.desc')}
                </Link>
              </>
            ) : (
              <p className="text-sm text-white/40">{t('client.noTracksAssigned')}</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {tracks.map((track, i) => {
              const Icon = track.conversation_style === 'guided' ? Briefcase : Factory;
              const stats = trackStats[track.id] || { sessions: 0, completion: 0 };
              const isCreating = creating === track.id;
              const color =
                stats.completion < 34 ? 'from-red-500/15 to-red-600/5 border-red-500/15' :
                stats.completion < 67 ? 'from-amber-500/15 to-amber-600/5 border-amber-500/15' :
                stats.completion < 100 ? 'from-blue-500/15 to-blue-600/5 border-blue-500/15' :
                'from-emerald-500/15 to-emerald-600/5 border-emerald-500/15';

              return (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <button
                    onClick={() => startSession(track.id)}
                    disabled={!!creating}
                    className="w-full text-left"
                  >
                    <div className={`kea-card kea-card-interactive p-4 bg-gradient-to-br ${color}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                          {isCreating ? (
                            <Loader2 size={18} className="animate-spin text-blue-400" />
                          ) : (
                            <Icon size={18} className="text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-white">{track.name}</h4>
                          <div className="flex items-center gap-3 text-[11px] text-white/30 mt-0.5">
                            <span>{stats.sessions} {t('chat.sessions')}</span>
                            <span>{stats.completion}% {t('chat.complete')}</span>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-white/20 shrink-0" />
                      </div>
                      <div className="mt-3 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all"
                          style={{ width: `${stats.completion}%` }}
                        />
                      </div>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
            {t('chat.recentSessions')}
          </h3>
          <div className="space-y-2">
            {sessions.map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.03 }}
              >
                <Link href={`/kea/chat/${session.id}`}>
                  <div className="kea-card kea-card-interactive px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0">
                      <MessageSquare size={14} className="text-white/30" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/70 truncate">
                        {session.summary || session.trackName || 'Session'}
                      </p>
                      <p className="text-[10px] text-white/20">
                        {session.trackCode} &bull; {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        session.status === 'active' ? 'bg-emerald-400' : 'bg-white/20'
                      }`} />
                      <Clock size={10} className="text-white/15" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {sessions.length === 0 && tracks.length > 0 && (
        <p className="text-center text-xs text-white/20 py-4">{t('chat.noSessionsYet')}</p>
      )}
    </div>
  );
}
