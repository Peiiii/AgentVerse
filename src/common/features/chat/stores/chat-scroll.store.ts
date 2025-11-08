import { create } from "zustand";

interface ChatScrollState {
  conversationId: string | null;
  pinned: boolean;
  initialSynced: boolean;
}

interface ChatScrollActions {
  setConversation: (conversationId: string | null) => void;
  setPinned: (pinned: boolean) => void;
  markInitialSynced: () => void;
}

export type ChatScrollStore = ChatScrollState & ChatScrollActions;

export const useChatScrollStore = create<ChatScrollStore>((set) => ({
  conversationId: null,
  pinned: true,
  initialSynced: false,
  setConversation: (conversationId) =>
    set({
      conversationId,
      pinned: true,
      initialSynced: false,
    }),
  setPinned: (pinned) => set({ pinned }),
  markInitialSynced: () => set({ initialSynced: true }),
}));
