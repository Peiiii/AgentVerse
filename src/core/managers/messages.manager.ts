import { messageService } from "@/core/services/message.service";
import type { AgentMessage, NormalMessage } from "@/common/types/discussion";
import { useMessagesStore } from "@/core/stores/messages.store";
import { discussionControlService } from "@/core/services/discussion-control.service";

export class MessagesManager {
  constructor() {
    discussionControlService.onCurrentDiscussionIdChange$.listen((id) => {
      void this.loadForDiscussion(id);
    });
  }

  loadForDiscussion = async (discussionId?: string | null) => {
    const store = useMessagesStore.getState();
    store.setLoading(true);
    const currentId = discussionControlService.getCurrentDiscussionId();
    if (discussionId && discussionId !== currentId) {
      store.setData(store.data, store.currentDiscussionId);
      return store.data;
    }
    const id = discussionId ?? currentId;
    if (!id) {
      store.setData([], null);
      return [] as AgentMessage[];
    }
    try {
      const list = await messageService.listMessages(id);
      store.setData(list, id);
      return list;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : "加载失败");
      return [] as AgentMessage[];
    }
  };

  loadForCurrent = async () => {
    return this.loadForDiscussion();
  };

  add = async (discussionId: string, message: Omit<NormalMessage, "id" | "discussionId">) => {
    const created = await messageService.addMessage(discussionId, message);
    await this.loadForDiscussion();
    // discussionService.updateLastMessage already done inside service
    return created;
  };

  create = async (message: Omit<AgentMessage, "id">) => {
    const created = await messageService.createMessage(message);
    await this.loadForDiscussion();
    return created;
  };

  update = async (id: string, updates: Partial<AgentMessage>) => {
    const updated = await messageService.updateMessage(id, updates);
    await this.loadForDiscussion();
    return updated;
  };

  remove = async (id: string) => {
    await messageService.deleteMessage(id);
    await this.loadForDiscussion();
  };

  clearForDiscussion = async (discussionId: string) => {
    await messageService.clearMessages(discussionId);
    if (discussionControlService.getCurrentDiscussionId() === discussionId) {
      await this.loadForDiscussion(discussionId);
    }
  };
}
