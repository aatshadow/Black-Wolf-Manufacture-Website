'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  Plus,
  Clock,
  ArrowRight,
  Mic,
  Search,
  Factory,
  Briefcase,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/lib/kea/stores/auth-store';
import { supabase } from '@/lib/kea/supabase-client';

interface TrackData {
  id: string;
  name: string;
  code: string;
  description: string | null;
  conversation_style: string;
  target_role: string;
  template_id: string;
}

interface SessionData {
  id: string;
  status: string;
  summary: string | null;
  created_at: string;
  track_id: string;
  track?: { name: string; code: string };
}

export default function ChatHubPage() {
  const [tracks, setTracks] = useState<TrackData[]>([]);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [trackStats, setTrackStats] = useState<Record<string, { sessions: number; completion: number }>>({});
  const [creating, setCreating] = useState(false);
  const organization = useAuthStore((s) => s.organization);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  // Load tracks and sessions from Supabase
  useEffect(() => {
    const loadData = async () => {
      if (!organization?.id) return;

      // Load tracks from templates belonging to this org
      const { data: templates } = await supabase
        .from('templates')
        .select('id')
        .eq('organization_id', organization.id);

      if (templates?.length) {
        const templateIds = templates.map((t) => t.id);
        const { data: trackData } = await supabase
          .from('tracks')
          .select('*')
          .in('template_id', templateIds)
          .order('display_order');

        if (trackData) setTracks(trackData);

        // Load sessions with track info
        const trackIds = trackData?.map((t) => t.id) || [];
        if (trackIds.length) {
          const { data: sessionData } = await supabase
            .from('sessions')
            .select('*, track:tracks(name, code)')
            .in('track_id', trackIds)
            .order('created_at', { ascending: false })
            .limit(20);

          if (sessionData) setSessions(sessionData as SessionData[]);

          // Load stats per track
          const stats: Record<string, { sessions: number; completion: number }> = {};
          for (const track of trackData || []) {
            const { count } = await supabase
              .from('sessions')
              .select('*', { count: 'exact', head: true })
              .eq('track_id', track.id);

            // Get progress snapshot
            const { data: progress } = await supabase
              .from('progress_snapshots')
              .select('completeness_pct')
              .eq('track_id', track.id)
              .is('block_id', null)
              .order('snapshot_date', { ascending: false })
              .limit(1);

            stats[track.id] = {
              sessions: count || 0,
              completion: progress?.[0]?.completeness_pct || 0,
            };
          }
          setTrackStats(stats);
        }
      }
    };
    loadData();
  }, [organization?.id]);

  const startNewSession = async () => {
    if (!selectedTrack || !user?.id || !organization?.id || creating) return;
    setCreating(true);

    try {
      const response = await fetch('/api/kea/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackId: selectedTrack,
          message: '__START_SESSION__',
          organizationId: organization.id,
          userId: user.id,
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
          } catch {
            // skip malformed chunks
          }
        }
      }

      // Process remaining buffer
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
      setCreating(false);
    }
  };

  const trackIcons: Record<string, typeof Factory> = {
    open_ended: Factory,
    guided: Briefcase,
  };

  return (
    <div className="max-w-[1200px] space-y-8">
      {/* Ask KEA section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="kea-card kea-glow-border p-6"
      >
        <h2 className="text-lg font-bold text-white mb-4 tracking-wide">ASK KEA</h2>
        <div className="flex items-center gap-3 mb-4">
          <button className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all">
            <Mic size={18} />
          </button>
          <div className="flex-1 flex items-center gap-[2px] h-8">
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-[2px] bg-blue-400/40 rounded-full"
                animate={{ height: [4, Math.random() * 20 + 4, 4] }}
                transition={{ duration: 1.5 + Math.random(), repeat: Infinity, delay: i * 0.05 }}
                style={{ height: 4 }}
              />
            ))}
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            className="kea-input pl-4 pr-12"
            placeholder="Search in extracted knowledge..."
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/60 transition-colors">
            <Search size={16} />
          </button>
        </div>
      </motion.div>

      {/* Track selection */}
      <div>
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
          Select Track
        </h3>
        {tracks.length === 0 ? (
          <div className="kea-card p-8 text-center">
            <p className="text-sm text-white/40 mb-2">No tracks available yet.</p>
            <p className="text-xs text-white/25">
              Create a template first in{' '}
              <Link href="/kea/dashboard/schemas" className="text-blue-400 hover:underline">
                Schemas
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tracks.map((track, i) => {
              const Icon = trackIcons[track.conversation_style] || Factory;
              const isSelected = selectedTrack === track.id;
              const stats = trackStats[track.id] || { sessions: 0, completion: 0 };
              return (
                <motion.button
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  onClick={() => setSelectedTrack(track.id)}
                  className={`kea-card p-6 text-left transition-all ${
                    isSelected
                      ? 'border-blue-500/30 bg-blue-500/[0.04] shadow-[0_0_30px_rgba(59,130,246,0.1)]'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center">
                      <Icon size={22} className="text-blue-400" />
                    </div>
                    <span className="kea-badge kea-badge-blue">{track.code}</span>
                  </div>
                  <h4 className="text-base font-semibold text-white mb-1">{track.name}</h4>
                  <p className="text-xs text-white/35 mb-4">{track.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-white/25">
                      <span>{stats.sessions} sessions</span>
                      <span>{stats.completion}% complete</span>
                    </div>
                    <span className="kea-badge kea-badge-green text-[10px]">
                      {track.conversation_style === 'open_ended' ? 'Open-ended' : 'Guided'}
                    </span>
                  </div>
                  <div className="mt-3 h-1 rounded-full bg-white/[0.04] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                      style={{ width: `${stats.completion}%` }}
                    />
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Start new session button */}
      {selectedTrack && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <button
            onClick={startNewSession}
            disabled={creating}
            className="kea-btn-primary inline-flex items-center gap-2 px-8"
          >
            {creating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Plus size={18} />
            )}
            Start New Session
            <ArrowRight size={16} />
          </button>
        </motion.div>
      )}

      {/* Recent sessions */}
      <div>
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
          Recent Sessions
        </h3>
        <div className="kea-card overflow-hidden">
          {sessions.length === 0 ? (
            <div className="p-6 text-center text-sm text-white/25">
              No sessions yet. Select a track and start a new session.
            </div>
          ) : (
            sessions.map((session, i) => (
              <Link key={session.id} href={`/kea/chat/${session.id}`}>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors border-b border-white/[0.04] last:border-0"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                    <MessageSquare size={15} className="text-white/30" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 font-medium truncate">
                      {session.summary || `Session — ${new Date(session.created_at).toLocaleDateString()}`}
                    </p>
                    <p className="text-xs text-white/25">
                      {session.track?.code} — {session.track?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`kea-badge ${
                        session.status === 'active'
                          ? 'kea-badge-green'
                          : session.status === 'paused'
                            ? 'kea-badge-amber'
                            : 'kea-badge-blue'
                      }`}
                    >
                      {session.status}
                    </span>
                    <span className="text-xs text-white/20 flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(session.created_at).toLocaleDateString()}
                    </span>
                    <ArrowRight size={14} className="text-white/15" />
                  </div>
                </motion.div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
