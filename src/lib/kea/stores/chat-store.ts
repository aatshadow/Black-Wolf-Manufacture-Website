'use client';

import { create } from 'zustand';
import type { Message, Session } from '@/types/database';

interface ChatState {
  currentSession: Session | null;
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  setCurrentSession: (session: Session | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setStreaming: (streaming: boolean) => void;
  setStreamingContent: (content: string) => void;
  appendStreamingContent: (chunk: string) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  currentSession: null,
  messages: [],
  isStreaming: false,
  streamingContent: '',
  setCurrentSession: (currentSession) => set({ currentSession }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  setStreaming: (isStreaming) => set({ isStreaming }),
  setStreamingContent: (streamingContent) => set({ streamingContent }),
  appendStreamingContent: (chunk) =>
    set((s) => ({ streamingContent: s.streamingContent + chunk })),
  reset: () =>
    set({
      currentSession: null,
      messages: [],
      isStreaming: false,
      streamingContent: '',
    }),
}));
