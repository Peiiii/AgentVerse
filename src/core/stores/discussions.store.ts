import { create } from "zustand";
import type { Discussion } from "@/common/types/discussion";

export interface DiscussionsState {
  data: Discussion[];
  isLoading: boolean;
  error: string | null;
  setLoading: (isLoading: boolean) => void;
  setData: (data: Discussion[]) => void;
  setError: (error: string | null) => void;
}

export const useDiscussionsStore = create<DiscussionsState>((set) => ({
  data: [],
  isLoading: false,
  error: null,
  setLoading: (isLoading) => set({ isLoading }),
  setData: (data) => set({ data, isLoading: false, error: null }),
  setError: (error) => set({ error, isLoading: false }),
}));
