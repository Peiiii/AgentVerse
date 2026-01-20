import { messageRepository } from "@/core/repositories/message.repository";
import type { AgentMessage, NormalMessage } from "@/common/types/discussion";
import { useMessagesStore } from "@/core/stores/messages.store";
import { getPresenter } from "@/core/presenter/presenter";
import type { DiscussionControlManager } from "@/core/managers/discussion-control.manager";

export class MessagesManager {
  private subscribed = false;
  private control: DiscussionControlManager | null = null;

  init(control: DiscussionControlManager) {
    if (this.subscribed) return;
    this.control = control;
    this.subscribed = true;
    control.onCurrentDiscussionIdChange$.listen((id) => {
      void this.loadForDiscussion(id);
    });
  }

  private getControl() {
    return this.control ?? getPresenter().discussionControl;
  }

  loadForDiscussion = async (discussionId?: string | null) => {
    if (!this.subscribed) {
      this.init(this.getControl());
    }
    const store = useMessagesStore.getState();
    store.setLoading(true);
    const currentId = this.getControl().getCurrentDiscussionId();
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
      const list = await messageRepository.listMessages(id);
      store.setData(list, id);
      return list;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : "加载失败");
      return [] as AgentMessage[];
    }
  };

  loadForCurrent = async () => {
    if (!this.subscribed) {
      this.init(this.getControl());
    }
    return this.loadForDiscussion();
  };

  add = async (discussionId: string, message: Omit<NormalMessage, "id" | "discussionId">) => {
    if (!this.subscribed) {
      this.init(this.getControl());
    }
    const created = await messageRepository.addMessage(discussionId, message);
    await this.loadForDiscussion();
    // discussionRepository.updateLastMessage already handled in repository
    return created;
  };

  create = async (message: Omit<AgentMessage, "id">) => {
    if (!this.subscribed) {
      this.init(this.getControl());
    }
    const created = await messageRepository.createMessage(message);
    await this.loadForDiscussion();
    return created;
  };

  update = async (id: string, updates: Partial<AgentMessage>) => {
    if (!this.subscribed) {
      this.init(this.getControl());
    }
    const updated = await messageRepository.updateMessage(id, updates);
    await this.loadForDiscussion();
    return updated;
  };

  remove = async (id: string) => {
    if (!this.subscribed) {
      this.init(this.getControl());
    }
    await messageRepository.deleteMessage(id);
    await this.loadForDiscussion();
  };

  clearForDiscussion = async (discussionId: string) => {
    if (!this.subscribed) {
      this.init(this.getControl());
    }
    await messageRepository.clearMessages(discussionId);
    if (this.getControl().getCurrentDiscussionId() === discussionId) {
      await this.loadForDiscussion(discussionId);
    }
  };
}
