import { create } from "zustand";
import type { MessageWithSender } from "@/lib/supabase/types";

export interface OptimisticMessage extends MessageWithSender {
  status?: "sending" | "failed";
  tempId?: string;
}

interface ChatState {
  messages: OptimisticMessage[];
  hasMore: boolean;
  isLoading: boolean;
  setMessages: (messages: OptimisticMessage[]) => void;
  prependMessages: (messages: OptimisticMessage[]) => void;
  appendMessage: (message: OptimisticMessage) => void;
  updateMessage: (id: string, update: Partial<OptimisticMessage>) => void;
  removeMessage: (id: string) => void;
  setHasMore: (hasMore: boolean) => void;
  setLoading: (loading: boolean) => void;
  updateAckCount: (messageId: string, delta: number) => void;
  clear: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  hasMore: true,
  isLoading: false,
  setMessages: (messages) => set({ messages }),
  prependMessages: (messages) =>
    set((state) => ({ messages: [...messages, ...state.messages] })),
  appendMessage: (message) =>
    set((state) => {
      // Avoid duplicates
      const exists = state.messages.some(
        (m) => m.id === message.id || (message.tempId && m.tempId === message.tempId)
      );
      if (exists) return state;
      return { messages: [...state.messages, message] };
    }),
  updateMessage: (id, update) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id || m.tempId === id ? { ...m, ...update } : m
      ),
    })),
  removeMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== id && m.tempId !== id),
    })),
  setHasMore: (hasMore) => set({ hasMore }),
  setLoading: (isLoading) => set({ isLoading }),
  updateAckCount: (messageId, delta) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId
          ? { ...m, ack_count: (m.ack_count ?? 0) + delta }
          : m
      ),
    })),
  clear: () => set({ messages: [], hasMore: true, isLoading: false }),
}));
