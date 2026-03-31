'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Database,
  ChevronRight,
  Send,
  Loader2,
  Sparkles,
  X,
  Check,
  Copy,
  Archive,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/kea/stores/auth-store';
import { supabase } from '@/lib/kea/supabase-client';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface TemplateItem {
  id: string;
  name: string;
  industry: string;
  version: number;
  is_public: boolean;
  created_at: string;
  tracks?: { id: string }[];
}

export default function SchemasPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [saving, setSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const organization = useAuthStore((s) => s.organization);
  const user = useAuthStore((s) => s.user);

  // Load templates from Supabase
  useEffect(() => {
    const loadTemplates = async () => {
      const { data } = await supabase
        .from('templates')
        .select('*, tracks(id)')
        .order('created_at', { ascending: false });

      if (data) setTemplates(data);
    };
    loadTemplates();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startNewTemplate = () => {
    setShowChat(true);
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: organization?.language === 'bg'
          ? 'Здравейте! Аз съм KEA Schema Architect. Ще ви помогна да създадете шаблон за извличане на знания. За каква индустрия или бизнес ще бъде този шаблон?'
          : '¡Hola! Soy KEA Schema Architect. Te voy a ayudar a crear un template de extracción de conocimiento completo.\n\n¿Para qué industria o tipo de negocio será este template? Cuéntame sobre la empresa y qué quieres descubrir.',
      },
    ]);
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsStreaming(true);

    // Create placeholder for assistant response
    const assistantId = (Date.now() + 1).toString();
    setMessages([...updatedMessages, { id: assistantId, role: 'assistant', content: '' }]);

    try {
      const response = await fetch('/api/kea/schema-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          organizationContext: organization
            ? { name: organization.name, industry: organization.industry, language: organization.language }
            : undefined,
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
        // Keep the last part as buffer (it might be incomplete)
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

            if (data.type === 'done') {
              // Check if the response contains a schema JSON
              if (fullText.includes('```schema-json')) {
                const match = fullText.match(/```schema-json\s*\n([\s\S]*?)\n\s*```/);
                if (match) {
                  await saveSchema(match[1]);
                }
              }
            }
          } catch {
            // Skip malformed JSON chunks
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim().startsWith('data: ')) {
        try {
          const data = JSON.parse(buffer.trim().slice(6));
          if (data.type === 'done' && fullText.includes('```schema-json')) {
            const match = fullText.match(/```schema-json\s*\n([\s\S]*?)\n\s*```/);
            if (match) {
              await saveSchema(match[1]);
            }
          }
        } catch {
          // ignore
        }
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

  const saveSchema = async (jsonStr: string) => {
    try {
      setSaving(true);
      const schema = JSON.parse(jsonStr);

      const response = await fetch('/api/kea/schemas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schema,
          organizationId: organization?.id,
          userId: user?.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Reload templates
        const { data } = await supabase
          .from('templates')
          .select('*, tracks(id)')
          .order('created_at', { ascending: false });
        if (data) setTemplates(data);

        // Add confirmation message
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: `✅ Template "${schema.template.name}" has been created and saved successfully! You can now view and edit it in the template list.`,
          },
        ]);
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-[1400px] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Templates</h2>
          <p className="text-xs text-white/30 mt-1">
            Create and manage knowledge extraction schemas
          </p>
        </div>
        <button
          onClick={startNewTemplate}
          className="kea-btn-primary flex items-center gap-2 text-sm"
        >
          <Sparkles size={16} />
          Create with AI
        </button>
      </div>

      {/* Template cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template, i) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link href={`/kea/dashboard/schemas/${template.id}`}>
              <div className="kea-card kea-card-interactive p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center">
                    <Database size={18} className="text-blue-400" />
                  </div>
                  <div className="flex gap-2">
                    {template.is_public && (
                      <span className="kea-badge kea-badge-green">Public</span>
                    )}
                    <span className="kea-badge kea-badge-blue">v{template.version}</span>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{template.name}</h3>
                <p className="text-xs text-white/30 mb-4">{template.industry}</p>
                <div className="flex items-center gap-3 text-xs text-white/25">
                  <span>{template.tracks?.length || 0} tracks</span>
                  <span>
                    {new Date(template.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/[0.04]">
                  <button
                    className="kea-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Copy size={12} /> Clone
                  </button>
                  <button
                    className="kea-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Archive size={12} /> Archive
                  </button>
                  <div className="flex-1" />
                  <ChevronRight size={16} className="text-white/15" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}

        {/* Add new card */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: templates.length * 0.1 }}
          onClick={startNewTemplate}
          className="kea-card kea-card-interactive p-5 flex flex-col items-center justify-center min-h-[200px] border-dashed"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center mb-3">
            <Sparkles size={20} className="text-blue-400/50" />
          </div>
          <p className="text-sm text-white/30">Create with AI Agent</p>
          <p className="text-xs text-white/15 mt-1">Conversational schema builder</p>
        </motion.button>
      </div>

      {/* AI Chat Overlay */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-3xl h-[80vh] bg-[#0a0a1a] border border-white/[0.08] rounded-2xl flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Chat header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                    <Sparkles size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">KEA Schema Architect</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 kea-pulse" />
                      <span className="text-[10px] text-white/25">
                        {isStreaming ? 'Thinking...' : saving ? 'Saving schema...' : 'Ready'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] ${
                        msg.role === 'user'
                          ? 'bg-blue-600/20 border border-blue-500/15 rounded-2xl rounded-br-md'
                          : 'bg-white/[0.03] border border-white/[0.06] rounded-2xl rounded-bl-md'
                      } px-4 py-3`}
                    >
                      <div className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                        {msg.content.split('```schema-json')[0]}
                        {msg.content.includes('```schema-json') && (
                          <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                            <Check size={16} className="text-emerald-400" />
                            <span className="text-xs text-emerald-400 font-medium">
                              Schema generated — saving to database...
                            </span>
                          </div>
                        )}
                        {isStreaming &&
                          msg.role === 'assistant' &&
                          msg.id === messages[messages.length - 1]?.id &&
                          !msg.content.includes('```schema-json') && (
                            <span className="inline-block w-1.5 h-4 ml-0.5 bg-blue-400 animate-pulse rounded-sm" />
                          )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-white/[0.06] p-4">
                <div className="flex items-end gap-3">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe your industry, business, or what you need to discover..."
                    rows={1}
                    className="kea-input flex-1 resize-none min-h-[44px] max-h-[120px]"
                    onInput={(e) => {
                      const el = e.currentTarget;
                      el.style.height = 'auto';
                      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isStreaming}
                    className="w-10 h-10 shrink-0 rounded-xl bg-blue-600 flex items-center justify-center text-white hover:bg-blue-500 transition-all disabled:opacity-30 mb-0.5"
                  >
                    {isStreaming ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
                <p className="text-center text-[10px] text-white/15 mt-2">
                  KEA will design your extraction schema through conversation
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
