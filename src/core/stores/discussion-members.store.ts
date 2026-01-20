import { create } from "zustand";
import type { DiscussionMember } from "@/common/types/discussion-member";

export interface DiscussionMembersState {
  data: DiscussionMember[];
  currentDiscussionId: string | null;
  isLoading: boolean;
  error: string | null;
  setLoading: (isLoading: boolean) => void;
  setData: (data: DiscussionMember[], discussionId: string | null) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export const useDiscussionMembersStore = create<DiscussionMembersState>(
  (set) => ({
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
  })
);
