import { useChatScrollStore } from "../stores/chat-scroll.store";

export class ChatScrollManager {
  setConversation = (conversationId: string | null) => {
    useChatScrollStore.getState().setConversation(conversationId);
  };

  setPinned = (pinned: boolean) => {
    useChatScrollStore.getState().setPinned(pinned);
  };

  markInitialSynced = () => {
    useChatScrollStore.getState().markInitialSynced();
  };
}

export const chatScrollManager = new ChatScrollManager();
