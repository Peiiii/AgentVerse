import {
  MobileScene,
  useMobileChatSceneStore,
} from "../stores/mobile-chat-scene.store";

export class MobileChatSceneManager {
  setScene = (scene: MobileScene) => {
    useMobileChatSceneStore.getState().setScene(scene);
  };

  toChat = () => {
    this.setScene("chat");
  };

  toDiscussions = () => {
    this.setScene("discussions");
  };

  toAgents = () => {
    this.setScene("agents");
  };

  toSettings = () => {
    this.setScene("settings");
  };

  handleDiscussionChange = (discussionId?: string | null) => {
    if (!discussionId) {
      return;
    }
    const { lastDiscussionId, setLastDiscussionId } = useMobileChatSceneStore.getState();
    if (lastDiscussionId === discussionId) {
      return;
    }
    setLastDiscussionId(discussionId);
    this.toChat();
  };
}

export const mobileChatSceneManager = new MobileChatSceneManager();
