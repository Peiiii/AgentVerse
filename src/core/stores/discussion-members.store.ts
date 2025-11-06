import { create } from "zustand";
import type { DiscussionMember } from "@/common/types/discussion-member";

export interface DiscussionMembersState {
  members: DiscussionMember[];
  isLoading: boolean;
  error?: string;

  setMembers: (list: DiscussionMember[]) => void;
  setLoading: (v: boolean) => void;
  setError: (msg?: string) => void;
}

export const useDiscussionMembersStore = create<DiscussionMembersState>()((set) => ({
  members: [],
  isLoading: false,
  error: undefined,

  setMembers: (list) => set({ members: list }),
  setLoading: (v) => set({ isLoading: v }),
  setError: (msg) => set({ error: msg }),
}));

