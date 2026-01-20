import { create } from "zustand";
import type { AgentMessage } from "@/common/types/discussion";

export interface MessagesState {
  data: AgentMessage[];
  currentDiscussionId: string | null;
  isLoading: boolean;
  error: string | null;
  setLoading: (isLoading: boolean) => void;
  setData: (data: AgentMessage[], discussionId: string | null) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export const useMessagesStore = create<MessagesState>((set) => ({
  data: [],
  currentDiscussionId: null,
  isLoading: false,
  error: null,
  setLoading: (isLoading) => set({ isLoading }),
  setData: (data, discussionId) =>
    set({
      data,
      currentDiscussionId: discussionId,
      isLoading: false,
      error: null,
    }),
  setError: (error) => set({ error, isLoading: false }),
  clear: () => set({ data: [], currentDiscussionId: null }),
}));
