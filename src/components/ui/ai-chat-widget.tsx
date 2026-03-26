"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, ArrowRight, Bot, User, Sparkles, Calendar } from "lucide-react";
import { WELCOME_MESSAGES, QUICK_ACTIONS } from "@/lib/agent-system-prompt";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
};

function detectLanguage(): string {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language?.slice(0, 2) || "en";
  if (["es", "bg"].includes(lang)) return lang;
  return "en";
}

function getLocalized(obj: Record<string, string>, lang: string): string {
  return obj[lang] || obj.en || obj.default || "";
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationDismissed, setNotificationDismissed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [lang] = useState(detectLanguage);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Show notification after 5 seconds
  useEffect(() => {
    const seen = sessionStorage.getItem("bw-chat-notif-seen");
    if (seen) return;

    const timer = setTimeout(() => {
      setShowNotification(true);
      sessionStorage.setItem("bw-chat-notif-seen", "1");
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const addMessage = useCallback((role: "assistant" | "user", content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, role, content, timestamp: new Date() },
    ]);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setShowNotification(false);
    setNotificationDismissed(true);

    // Add welcome message if first time opening
    if (messages.length === 0) {
      const welcome = WELCOME_MESSAGES[lang] || WELCOME_MESSAGES.default;
      addMessage("assistant", welcome);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    addMessage("user", messageText);
    setInput("");
    setShowQuickActions(false);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          history: [...messages, { role: "user", content: messageText }].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          lang,
          conversationId,
        }),
      });

      if (!res.ok) throw new Error("Chat API error");

      const data = await res.json();
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }
      addMessage("assistant", data.reply);
    } catch {
      const errorMsg = lang === "es"
        ? "Perdona, ha habido un error. ¿Puedes intentarlo de nuevo?"
        : lang === "bg"
          ? "Извинете, имаше грешка. Можете ли да опитате отново?"
          : "Sorry, something went wrong. Can you try again?";
      addMessage("assistant", errorMsg);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (actionId: string) => {
    const action = QUICK_ACTIONS.find((a) => a.id === actionId);
    if (!action) return;
    handleSend(getLocalized(action.prompt, lang));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Notification bubble */}
      <AnimatePresence>
        {showNotification && !notificationDismissed && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-5 z-[9997] max-w-[280px] cursor-pointer rounded-2xl border border-white/[0.08] bg-[#0a0a18]/95 p-4 shadow-[0_0_40px_rgba(37,99,235,0.15)] backdrop-blur-xl md:right-6"
            onClick={handleOpen}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setNotificationDismissed(true);
                setShowNotification(false);
              }}
              className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-white/30 transition-colors hover:text-white/60"
            >
              <X className="h-3 w-3" />
            </button>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600/20 border border-blue-500/30">
                <Bot className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-[13px] leading-relaxed text-white/80">
                  {lang === "es"
                    ? "Bienvenido a BlackWolf 👋 ¿Tienes alguna pregunta?"
                    : lang === "bg"
                      ? "Добре дошли в BlackWolf 👋 Имате ли въпроси?"
                      : "Welcome to BlackWolf 👋 Got any questions?"}
                </p>
                <p className="mt-1 text-[10px] text-white/30">
                  {lang === "es" ? "Zlatina's AI · Responde al instante" : lang === "bg" ? "AI на Златина · Отговаря веднага" : "Zlatina's AI · Replies instantly"}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat button */}
      <motion.button
        onClick={isOpen ? handleClose : handleOpen}
        className="fixed bottom-5 right-5 z-[9997] flex h-14 w-14 items-center justify-center rounded-full border border-blue-500/30 bg-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all hover:bg-blue-500 hover:shadow-[0_0_40px_rgba(37,99,235,0.4)] md:right-6"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="h-5 w-5 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <MessageSquare className="h-5 w-5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread indicator */}
        {showNotification && !notificationDismissed && !isOpen && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-blue-500" />
          </span>
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-5 z-[9997] flex h-[520px] w-[380px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#070714]/98 shadow-[0_0_60px_rgba(37,99,235,0.12)] backdrop-blur-xl md:right-6"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-blue-500/30 bg-blue-600/20">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#070714] bg-green-500" />
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-medium text-white">BlackWolf AI</div>
                <div className="text-[10px] text-white/30">
                  {lang === "es" ? "Asistente de Zlatina · Online" : lang === "bg" ? "Асистент на Златина · Онлайн" : "Zlatina's Assistant · Online"}
                </div>
              </div>
              <button onClick={handleClose} className="flex h-7 w-7 items-center justify-center rounded-full text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white/60">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin">
              <div className="flex flex-col gap-3">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-blue-500/20 bg-blue-600/10">
                        <Bot className="h-3.5 w-3.5 text-blue-400" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                        msg.role === "user"
                          ? "rounded-br-md bg-blue-600 text-white"
                          : "rounded-bl-md border border-white/[0.06] bg-white/[0.03] text-white/80"
                      }`}
                    >
                      {msg.content.split("\n").map((line, i) => (
                        <span key={i}>
                          {/* Detect and render Calendly links */}
                          {line.includes("calendly.com") ? (
                            <>
                              {line.split(/(https:\/\/calendly\.com\/[^\s]+)/).map((part, j) =>
                                part.startsWith("https://calendly.com") ? (
                                  <a
                                    key={j}
                                    href={part}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-blue-400 underline decoration-blue-400/30 transition-colors hover:text-blue-300"
                                  >
                                    <Calendar className="inline h-3 w-3" />
                                    {lang === "es" ? "Agendar llamada" : lang === "bg" ? "Запази обаждане" : "Book a call"}
                                  </a>
                                ) : (
                                  <span key={j}>{part}</span>
                                )
                              )}
                            </>
                          ) : (
                            line
                          )}
                          {i < msg.content.split("\n").length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                    {msg.role === "user" && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04]">
                        <User className="h-3.5 w-3.5 text-white/50" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2.5"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-blue-500/20 bg-blue-600/10">
                      <Bot className="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                      <motion.span className="h-1.5 w-1.5 rounded-full bg-blue-400/60" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }} />
                      <motion.span className="h-1.5 w-1.5 rounded-full bg-blue-400/60" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} />
                      <motion.span className="h-1.5 w-1.5 rounded-full bg-blue-400/60" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} />
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick actions */}
              {showQuickActions && messages.length <= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-4 flex flex-col gap-2"
                >
                  {QUICK_ACTIONS.map((action, i) => (
                    <motion.button
                      key={action.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      onClick={() => handleQuickAction(action.id)}
                      className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-left transition-all hover:border-blue-500/20 hover:bg-white/[0.04]"
                    >
                      <div className="flex-1">
                        <div className="text-[12px] font-medium text-white/70 group-hover:text-white/90">
                          {getLocalized(action.label, lang)}
                        </div>
                        <div className="text-[10px] text-white/30">
                          {getLocalized(action.description, lang)}
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-blue-400/60" />
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-white/[0.06] px-4 py-3">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    lang === "es" ? "Escribe tu mensaje..." : lang === "bg" ? "Напишете съобщение..." : "Type your message..."
                  }
                  className="flex-1 bg-transparent text-[13px] text-white placeholder-white/25 outline-none"
                />
                <motion.button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white transition-all hover:bg-blue-500 disabled:opacity-30"
                >
                  <Send className="h-3.5 w-3.5" />
                </motion.button>
              </div>
              <div className="mt-2 text-center text-[9px] text-white/15">
                Powered by BlackWolf AI
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
