import { create } from "zustand";

export type MobileScene = "discussions" | "chat" | "agents";

interface MobileChatSceneState {
  scene: MobileScene;
  lastDiscussionId: string | null;
}

interface MobileChatSceneActions {
  setScene: (scene: MobileScene) => void;
  setLastDiscussionId: (discussionId: string | null) => void;
}

export type MobileChatSceneStore = MobileChatSceneState & MobileChatSceneActions;

export const useMobileChatSceneStore = create<MobileChatSceneStore>((set) => ({
  scene: "chat",
  lastDiscussionId: null,
  setScene: (scene) => set({ scene }),
  setLastDiscussionId: (discussionId) => set({ lastDiscussionId: discussionId }),
}));
