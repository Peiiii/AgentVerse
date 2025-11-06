import { create } from "zustand";
import type { Discussion } from "@/common/types/discussion";

export interface DiscussionsState {
  discussions: Discussion[];
  currentId: string | null;
  isLoading: boolean;
  error?: string;

  setDiscussions: (ds: Discussion[]) => void;
  setCurrentId: (id: string | null) => void;
  setLoading: (v: boolean) => void;
  setError: (msg?: string) => void;
}

export const useDiscussionsStore = create<DiscussionsState>()((set) => ({
  discussions: [],
  currentId: null,
  isLoading: false,
  error: undefined,

  setDiscussions: (ds) => set({ discussions: ds }),
  setCurrentId: (id) => set({ currentId: id }),
  setLoading: (v) => set({ isLoading: v }),
  setError: (msg) => set({ error: msg }),
}));

