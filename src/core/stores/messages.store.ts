import { create } from "zustand";
import type { AgentMessage } from "@/common/types/discussion";

export interface MessagesState {
  messages: AgentMessage[];
  isLoading: boolean;
  error?: string;

  setMessages: (list: AgentMessage[]) => void;
  setLoading: (v: boolean) => void;
  setError: (msg?: string) => void;
}

export const useMessagesStore = create<MessagesState>()((set) => ({
  messages: [],
  isLoading: false,
  error: undefined,

  setMessages: (list) => set({ messages: list }),
  setLoading: (v) => set({ isLoading: v }),
  setError: (msg) => set({ error: msg }),
}));

