'use client';

import { motion } from 'framer-motion';
import {
  Radio,
  MessageSquare,
  User,
  Clock,
  Eye,
  Circle,
  Loader2,
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/lib/kea/stores/auth-store';
import { supabase } from '@/lib/kea/supabase-client';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

interface SessionWithInfo {
  id: string;
  organization_id: string;
  user_id: string;
  track_id: string;
  session_number?: number;
  status: string;
  started_at: string;
  title: string | null;
  user_profiles: { full_name: string } | null;
  tracks: { name: string } | null;
}

interface MessageRecord {
  id: string;
  session_id: string;
  role: string;
  content: string;
  created_at: string;
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

export default function MonitorPage() {
  const { organization } = useAuthStore();
  const [sessions, setSessions] = useState<SessionWithInfo[]>([]);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchSessions = useCallback(async () => {
    if (!organization) return;
    const { data, error } = await supabase
      .from('sessions')
      .select('*, user_profiles(full_name), tracks(name)')
      .eq('organization_id', organization.id)
      .eq('status', 'active')
      .order('started_at', { ascending: false });
    if (!error && data) {
      const typed = data as unknown as SessionWithInfo[];
      setSessions(typed);
      if (!selectedSessionId && typed.length > 0) {
        setSelectedSessionId(typed[0].id);
      }
    }
    setLoading(false);
  }, [organization, selectedSessionId]);

  const fetchMessages = useCallback(async () => {
    if (!selectedSessionId) {
      setMessages([]);
      return;
    }
    setMessagesLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('id, session_id, role, content, created_at')
      .eq('session_id', selectedSessionId)
      .order('created_at', { ascending: true });
    if (!error && data) {
      setMessages(data as unknown as MessageRecord[]);
    }
    setMessagesLoading(false);
  }, [selectedSessionId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Auto-refresh every 12 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSessions();
      fetchMessages();
    }, 12000);
    return () => clearInterval(interval);
  }, [fetchSessions, fetchMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

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
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/15 flex items-center justify-center">
            <Radio size={18} className="text-red-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Live Chat Monitor</h2>
            <p className="text-xs text-white/30">
              {sessions.length} active session{sessions.length !== 1 ? 's' : ''} &middot; Auto-refreshing
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400">Live</span>
        </div>
      </motion.div>

      {sessions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="kea-card p-12 flex flex-col items-center justify-center"
        >
          <Radio size={32} className="text-white/10 mb-3" />
          <p className="text-sm text-white/30">No active sessions right now</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: '600px' }}>
          {/* Session List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="kea-card p-4 space-y-2"
          >
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider px-2 mb-3">
              Active Sessions
            </h3>
            {sessions.map((session, i) => {
              const userName = (session.user_profiles as unknown as { full_name: string } | null)?.full_name || 'Unknown User';
              const trackName = (session.tracks as unknown as { name: string } | null)?.name || 'Unknown Track';
              return (
                <motion.button
                  key={session.id}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  onClick={() => setSelectedSessionId(session.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    selectedSessionId === session.id
                      ? 'bg-blue-500/10 border border-blue-500/15'
                      : 'hover:bg-white/[0.02] border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center">
                        <User size={13} className="text-white/40" />
                      </div>
                      <span className="text-sm text-white/70 font-medium">{userName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] text-white/25">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/25 mb-1.5">
                    <span className="kea-badge kea-badge-blue">{trackName}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-white/15">
                    <span className="flex items-center gap-1">
                      <Clock size={9} /> {timeAgo(session.started_at)}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Chat View (read-only) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="kea-card p-4 lg:col-span-2 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <Eye size={14} className="text-white/25" />
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                  Read-Only View
                </h3>
              </div>
              {selectedSession && (
                <span className="kea-badge kea-badge-blue">
                  {(selectedSession.user_profiles as unknown as { full_name: string } | null)?.full_name || 'Unknown'} &mdash;{' '}
                  {(selectedSession.tracks as unknown as { name: string } | null)?.name || 'Unknown Track'}
                </span>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 px-2 mb-4 max-h-[500px]">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={20} className="text-blue-400 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <MessageSquare size={24} className="text-white/10 mb-2" />
                  <p className="text-xs text-white/20">No messages yet</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-xl text-sm ${
                        msg.role === 'user'
                          ? 'bg-blue-500/10 border border-blue-500/15 text-white/70'
                          : msg.role === 'system'
                            ? 'bg-amber-500/10 border border-amber-500/15 text-amber-300/60'
                            : 'bg-white/[0.03] border border-white/[0.06] text-white/50'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className="text-[9px] text-white/15 mt-1">{timeAgo(msg.created_at)}</p>
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing indicator for active sessions */}
            {selectedSession && (
              <div className="border-t border-white/[0.06] pt-3 px-2">
                <div className="flex items-center gap-2 text-xs text-white/20">
                  <Circle size={6} className="text-emerald-400 animate-pulse" />
                  <span>Session is active &mdash; monitoring in real-time</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
