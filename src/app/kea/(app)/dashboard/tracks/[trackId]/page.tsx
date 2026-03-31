'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Layers,
  MessageSquare,
  Clock,
  ChevronRight,
  Zap,
  HelpCircle,
  Send,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/kea/stores/auth-store';
import { supabase } from '@/lib/kea/supabase-client';
import type { Track, InjectedQuestion } from '@/types/database';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

interface BlockWithCounts {
  id: string;
  name: string;
  code: string;
  description: string | null;
  display_order: number;
  fieldCount: number;
  filledCount: number;
}

interface SessionWithUser {
  id: string;
  user_id: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  fields_covered: string[];
  user_profiles: { full_name: string } | null;
}

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

function ProgressBar({ percentage }: { percentage: number }) {
  const color =
    percentage === 0 ? 'bg-white/10' :
    percentage < 50 ? 'bg-amber-400' :
    percentage < 100 ? 'bg-blue-400' : 'bg-emerald-400';

  return (
    <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </div>
  );
}

export default function TrackDetailPage() {
  const params = useParams();
  const trackId = params.trackId as string;
  const { organization, user } = useAuthStore();

  const [track, setTrack] = useState<Track | null>(null);
  const [blocks, setBlocks] = useState<BlockWithCounts[]>([]);
  const [sessions, setSessions] = useState<SessionWithUser[]>([]);
  const [questions, setQuestions] = useState<InjectedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!organization || !trackId) return;

    // Fetch track
    const { data: trackData } = await supabase
      .from('tracks')
      .select('*')
      .eq('id', trackId)
      .single();
    if (trackData) setTrack(trackData as unknown as Track);

    // Fetch blocks with field counts
    const { data: blocksData } = await supabase
      .from('schema_blocks')
      .select('id, name, code, description, display_order')
      .eq('track_id', trackId)
      .order('display_order', { ascending: true });

    if (blocksData) {
      const blockIds = blocksData.map((b: { id: string }) => b.id);

      // Count fields per block
      const { data: fieldsData } = await supabase
        .from('schema_fields')
        .select('block_id')
        .in('block_id', blockIds.length > 0 ? blockIds : ['__none__']);

      // Get extraction instances for completion
      const { data: instancesData } = await supabase
        .from('extraction_instances')
        .select('block_id, data, completeness_pct')
        .eq('organization_id', organization.id)
        .in('block_id', blockIds.length > 0 ? blockIds : ['__none__']);

      const fieldCountMap: Record<string, number> = {};
      (fieldsData || []).forEach((f: { block_id: string }) => {
        fieldCountMap[f.block_id] = (fieldCountMap[f.block_id] || 0) + 1;
      });

      const filledCountMap: Record<string, number> = {};
      (instancesData || []).forEach((inst: { block_id: string; data: Record<string, unknown> }) => {
        const filled = Object.values(inst.data || {}).filter((v) => v !== null && v !== '' && v !== undefined).length;
        filledCountMap[inst.block_id] = (filledCountMap[inst.block_id] || 0) + filled;
      });

      setBlocks(
        (blocksData as unknown as BlockWithCounts[]).map((b) => ({
          ...b,
          fieldCount: fieldCountMap[b.id] || 0,
          filledCount: Math.min(filledCountMap[b.id] || 0, fieldCountMap[b.id] || 0),
        }))
      );
    }

    // Fetch sessions
    const { data: sessionsData } = await supabase
      .from('sessions')
      .select('id, user_id, status, started_at, ended_at, fields_covered, user_profiles(full_name)')
      .eq('track_id', trackId)
      .eq('organization_id', organization.id)
      .order('started_at', { ascending: false })
      .limit(20);
    if (sessionsData) setSessions(sessionsData as unknown as SessionWithUser[]);

    // Fetch injected questions
    const { data: questionsData } = await supabase
      .from('injected_questions')
      .select('*')
      .eq('track_id', trackId)
      .eq('organization_id', organization.id)
      .order('created_at', { ascending: false });
    if (questionsData) setQuestions(questionsData as unknown as InjectedQuestion[]);

    setLoading(false);
  }, [organization, trackId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleAddQuestion() {
    if (!organization || !user || !newQuestion.trim() || !trackId) return;
    setSubmitting(true);
    const { error } = await supabase
      .from('injected_questions')
      .insert({
        track_id: trackId,
        organization_id: organization.id,
        question: newQuestion.trim(),
        priority: newPriority,
        status: 'pending',
        created_by: user.id,
      });
    if (!error) {
      setNewQuestion('');
      fetchData();
    }
    setSubmitting(false);
  }

  const totalFields = blocks.reduce((s, b) => s + b.fieldCount, 0);
  const totalFilled = blocks.reduce((s, b) => s + b.filledCount, 0);
  const completion = totalFields > 0 ? Math.round((totalFilled / totalFields) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Link
          href="/kea/dashboard"
          className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
        >
          <ArrowLeft size={16} className="text-white/50" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-white">
              {track?.name || 'Track'}
            </h2>
            {track?.conversation_style && (
              <span className="kea-badge kea-badge-blue capitalize">{track.conversation_style}</span>
            )}
          </div>
          <p className="text-xs text-white/30 mt-0.5">
            {totalFilled}/{totalFields} fields extracted &middot; {completion}% complete
          </p>
        </div>
      </motion.div>

      {/* Blocks Grid */}
      <div>
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
          Blocks
        </h3>
        {blocks.length === 0 ? (
          <div className="kea-card p-8 text-center">
            <Layers size={24} className="text-white/10 mx-auto mb-2" />
            <p className="text-xs text-white/20">No blocks defined for this track</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {blocks.map((block, i) => {
              const pct = block.fieldCount > 0 ? Math.round((block.filledCount / block.fieldCount) * 100) : 0;
              const statusBadge =
                pct === 100
                  ? 'kea-badge-green'
                  : pct > 0
                    ? 'kea-badge-blue'
                    : 'kea-badge-amber';
              const statusLabel =
                pct === 100
                  ? 'Complete'
                  : pct > 0
                    ? 'In Progress'
                    : 'Not Started';

              return (
                <motion.div
                  key={block.id}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="kea-card kea-card-interactive p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center">
                      <Layers size={16} className="text-blue-400" />
                    </div>
                    <span className={`kea-badge ${statusBadge}`}>{statusLabel}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1">{block.name}</h4>
                  <p className="text-xs text-white/25 mb-3">
                    {block.filledCount}/{block.fieldCount} fields
                  </p>
                  <ProgressBar percentage={pct} />
                  <p className="text-right text-[10px] text-white/20 mt-1">{pct}%</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="kea-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
              Sessions
            </h3>
            <span className="text-xs text-white/20">{sessions.length} total</span>
          </div>
          {sessions.length === 0 ? (
            <div className="py-8 text-center">
              <MessageSquare size={20} className="text-white/10 mx-auto mb-2" />
              <p className="text-xs text-white/20">No sessions yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sessions.map((session, i) => {
                const userName = (session.user_profiles as unknown as { full_name: string } | null)?.full_name || 'Unknown User';
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                      <MessageSquare size={14} className="text-white/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/70">{userName}</p>
                      <p className="text-xs text-white/25 truncate">
                        {session.fields_covered?.length || 0} fields covered &middot;{' '}
                        <span className={`${session.status === 'active' ? 'text-emerald-400' : 'text-white/25'}`}>
                          {session.status}
                        </span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-white/30 flex items-center gap-1">
                        <Clock size={10} /> {timeAgo(session.started_at)}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-white/10 group-hover:text-white/30 transition-colors" />
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Injected Questions Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="kea-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
              Injected Questions
            </h3>
            <HelpCircle size={14} className="text-white/20" />
          </div>

          {questions.length === 0 ? (
            <div className="py-6 text-center mb-4">
              <Zap size={20} className="text-white/10 mx-auto mb-2" />
              <p className="text-xs text-white/20">No injected questions yet</p>
            </div>
          ) : (
            <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
              {questions.map((q, i) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm text-white/60">{q.question}</p>
                    <span
                      className={`kea-badge shrink-0 ${
                        q.status === 'answered'
                          ? 'kea-badge-green'
                          : q.status === 'asked'
                            ? 'kea-badge-blue'
                            : 'kea-badge-amber'
                      }`}
                    >
                      {q.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-white/20">
                    <span className="flex items-center gap-1">
                      <Zap size={10} /> Priority: {q.priority}
                    </span>
                    {q.context && <span>Context: {q.context}</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Add question input */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                className="kea-input text-sm flex-1"
                placeholder="Inject a new question..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddQuestion()}
              />
              <select
                className="kea-input text-xs w-24"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as 'low' | 'normal' | 'high')}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
              <button
                onClick={handleAddQuestion}
                disabled={submitting || !newQuestion.trim()}
                className="kea-btn-primary px-4 flex items-center gap-1 shrink-0 disabled:opacity-30"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
