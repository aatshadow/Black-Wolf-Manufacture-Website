'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Paperclip,
  ChevronLeft,
  MoreHorizontal,
  Loader2,
  Menu,
  X,
  Check,
  Pause,
  Play,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/kea/stores/auth-store';
import { supabase } from '@/lib/kea/supabase-client';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface BlockProgress {
  id: string;
  name: string;
  code: string;
  completeness_pct: number;
}

interface DiscoveredEntity {
  instance_label: string;
  completeness_pct: number;
}

interface TrackInfo {
  id: string;
  name: string;
  code: string;
  conversation_style: string;
}

interface SessionInfo {
  id: string;
  status: string;
  track_id: string;
  user_id: string;
  created_at: string;
  track?: TrackInfo;
}

export default function ChatSessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [blocks, setBlocks] = useState<BlockProgress[]>([]);
  const [entities, setEntities] = useState<DiscoveredEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const organization = useAuthStore((s) => s.organization);
  const user = useAuthStore((s) => s.user);

  // Load session, messages, and progress
  const loadSession = useCallback(async () => {
    if (!sessionId) return;

    // Load session with track
    const { data: sessionData } = await supabase
      .from('sessions')
      .select('*, track:tracks(id, name, code, conversation_style)')
      .eq('id', sessionId)
      .single();

    if (sessionData) {
      setSession(sessionData as SessionInfo);

      // Load messages
      const { data: msgData } = await supabase
        .from('messages')
        .select('id, role, content, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (msgData) setMessages(msgData as ChatMessage[]);

      // Load block progress
      const trackId = (sessionData as SessionInfo).track_id;
      const { data: blockData } = await supabase
        .from('schema_blocks')
        .select('id, name, code, track_id')
        .eq('track_id', trackId)
        .order('display_order');

      if (blockData) {
        // Get extraction instances for completeness
        const blockIds = blockData.map((b) => b.id);
        const { data: instances } = await supabase
          .from('extraction_instances')
          .select('block_id, completeness_pct')
          .in('block_id', blockIds);

        const instanceMap = new Map(
          (instances || []).map((i) => [i.block_id, i.completeness_pct])
        );

        setBlocks(
          blockData.map((b) => ({
            id: b.id,
            name: b.name,
            code: b.code,
            completeness_pct: instanceMap.get(b.id) || 0,
          }))
        );

        // Load discovered entities
        const { data: entityData } = await supabase
          .from('extraction_instances')
          .select('instance_label, completeness_pct')
          .in('block_id', blockIds)
          .not('instance_label', 'is', null);

        if (entityData) setEntities(entityData as DiscoveredEntity[]);
      }
    }

    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input after loading
  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [loading]);

  // Refresh progress periodically (extraction happens in background)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isStreaming && session?.track_id) {
        // Silently reload block progress
        const reloadProgress = async () => {
          const { data: blockData } = await supabase
            .from('schema_blocks')
            .select('id, name, code')
            .eq('track_id', session.track_id)
            .order('display_order');

          if (blockData) {
            const blockIds = blockData.map((b) => b.id);
            const { data: instances } = await supabase
              .from('extraction_instances')
              .select('block_id, completeness_pct, instance_label')
              .in('block_id', blockIds);

            const instanceMap = new Map(
              (instances || []).map((i) => [i.block_id, i.completeness_pct])
            );

            setBlocks(
              blockData.map((b) => ({
                id: b.id,
                name: b.name,
                code: b.code,
                completeness_pct: instanceMap.get(b.id) || 0,
              }))
            );

            const ents = (instances || [])
              .filter((i) => i.instance_label)
              .map((i) => ({
                instance_label: i.instance_label,
                completeness_pct: i.completeness_pct,
              }));
            setEntities(ents);
          }
        };
        reloadProgress();
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [isStreaming, session?.track_id]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming || !session || !user || !organization) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsStreaming(true);

    // Placeholder for assistant response
    const assistantId = (Date.now() + 1).toString();
    setMessages([
      ...updatedMessages,
      { id: assistantId, role: 'assistant', content: '', created_at: new Date().toISOString() },
    ]);

    try {
      const response = await fetch('/api/kea/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          trackId: session.track_id,
          message: input.trim(),
          organizationId: organization.id,
          userId: user.id,
        }),
      });

      if (!response.ok) throw new Error('API error');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let fullText = '';
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

            if (data.type === 'text') {
              fullText += data.text;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: fullText } : m))
              );
            }

            if (data.type === 'done' && data.messageId) {
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, id: data.messageId } : m))
              );
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim().startsWith('data: ')) {
        try {
          const data = JSON.parse(buffer.trim().slice(6));
          if (data.type === 'text') {
            fullText += data.text;
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: fullText } : m))
            );
          }
          if (data.type === 'done' && data.messageId) {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, id: data.messageId } : m))
            );
          }
        } catch { /* ignore */ }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: 'Sorry, there was an error. Please try again.' }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleSessionStatus = async () => {
    if (!session) return;
    const newStatus = session.status === 'active' ? 'paused' : 'active';
    await supabase.from('sessions').update({ status: newStatus }).eq('id', session.id);
    setSession({ ...session, status: newStatus });
  };

  const overallCompletion = blocks.length
    ? Math.round(blocks.reduce((sum, b) => sum + b.completeness_pct, 0) / blocks.length)
    : 0;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#050510] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-400" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="fixed inset-0 bg-[#050510] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 mb-4">Session not found</p>
          <Link href="/kea/chat" className="kea-btn-primary">
            Back to Chat Hub
          </Link>
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-white/[0.06]">
        <Link
          href="/kea/chat"
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          <ChevronLeft size={16} /> Back to Chat Hub
        </Link>
      </div>

      <div className="p-4">
        <span className="kea-badge kea-badge-blue mb-2 inline-block">
          {session.track?.code || 'Track'}
        </span>
        <h3 className="text-sm font-semibold text-white">
          {session.track?.name || 'Session'}
        </h3>
        <p className="text-xs text-white/25 mt-1">
          {new Date(session.created_at).toLocaleDateString()} &bull; {overallCompletion}% overall
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-3">
        <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest">
          Block Progress
        </p>
        {blocks.map((block) => (
          <div key={block.id} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">{block.name}</span>
              <span className="text-[10px] text-white/25">{block.completeness_pct}%</span>
            </div>
            <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  block.completeness_pct === 0
                    ? 'bg-white/[0.06]'
                    : block.completeness_pct < 34
                      ? 'bg-red-500/60'
                      : block.completeness_pct < 67
                        ? 'bg-amber-500/60'
                        : 'bg-blue-500/60'
                }`}
                style={{ width: `${Math.max(block.completeness_pct, 2)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {entities.length > 0 && (
        <div className="p-4 border-t border-white/[0.06]">
          <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest mb-2">
            Discovered Entities
          </p>
          {entities.map((entity) => (
            <div
              key={entity.instance_label}
              className="flex items-center gap-2 py-1.5 text-xs text-white/40"
            >
              <Check size={12} className="text-emerald-400/60" />
              {entity.instance_label}
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="fixed inset-0 bg-[#050510] flex" style={{ marginLeft: 0 }}>
      {/* Progress Sidebar (desktop) */}
      <aside className="hidden lg:flex flex-col w-[280px] border-r border-white/[0.06] bg-[#050510]/95 backdrop-blur-xl">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-[#050510] border-r border-white/[0.06] z-50 lg:hidden flex flex-col"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 text-white/30 hover:text-white/60"
              >
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <header className="h-14 border-b border-white/[0.06] bg-[#050510]/80 backdrop-blur-xl flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-white/40 hover:text-white/70"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-sm font-semibold text-white">
                {session.track?.name || 'Chat'}
              </h2>
              <div className="flex items-center gap-2">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    session.status === 'active' ? 'bg-emerald-400 kea-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className="text-[10px] text-white/25">
                  {isStreaming ? 'KEA is thinking...' : session.status === 'active' ? 'Session active' : 'Session paused'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSessionStatus}
              className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 transition-all"
              title={session.status === 'active' ? 'Pause session' : 'Resume session'}
            >
              {session.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 transition-all">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] ${
                  msg.role === 'user'
                    ? 'bg-blue-600/20 border border-blue-500/15 rounded-2xl rounded-br-md'
                    : 'bg-white/[0.03] border border-white/[0.06] rounded-2xl rounded-bl-md'
                } px-4 py-3`}
              >
                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                  {isStreaming &&
                    msg.role === 'assistant' &&
                    msg.id === messages[messages.length - 1]?.id && (
                      <span className="inline-block w-1.5 h-4 ml-0.5 bg-blue-400 animate-pulse rounded-sm" />
                    )}
                </p>
                <p className="text-[10px] text-white/15 mt-2 text-right">
                  {new Date(msg.created_at).toLocaleTimeString('en', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })}
                </p>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="border-t border-white/[0.06] p-4 bg-[#050510]/90 backdrop-blur-xl">
          <div className="flex items-end gap-3 max-w-[900px] mx-auto">
            <button className="w-10 h-10 shrink-0 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 hover:border-white/10 transition-all mb-0.5">
              <Paperclip size={18} />
            </button>
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                className="kea-input resize-none min-h-[44px] max-h-[120px] pr-12"
                style={{
                  height: 'auto',
                  overflowY: input.split('\n').length > 4 ? 'auto' : 'hidden',
                }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = 'auto';
                  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
                }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="w-10 h-10 shrink-0 rounded-xl bg-blue-600 flex items-center justify-center text-white hover:bg-blue-500 transition-all disabled:opacity-30 disabled:hover:bg-blue-600 mb-0.5"
            >
              {isStreaming ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          <p className="text-center text-[10px] text-white/15 mt-2">
            Shift+Enter for new line &bull; KEA extracts knowledge automatically
          </p>
        </div>
      </div>
    </div>
  );
}
