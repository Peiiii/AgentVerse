import { discussionService } from "@/core/services/discussion.service";
import { discussionControlService } from "@/core/services/discussion-control.service";
import type { Discussion } from "@/common/types/discussion";
import { messageService } from "@/core/services/message.service";
import { useDiscussionsStore } from "@/core/stores/discussions.store";
import { useMessagesStore } from "@/core/stores/messages.store";

export class DiscussionsManager {
  getAll = () => useDiscussionsStore.getState().data;
  getCurrentId = () => discussionControlService.getCurrentDiscussionId();
  getCurrent = () => {
    const id = this.getCurrentId();
    if (!id) return null;
    return this.getAll().find((item) => item.id === id) ?? null;
  };

  load = async () => {
    const store = useDiscussionsStore.getState();
    store.setLoading(true);
    try {
      let list = await discussionService.listDiscussions();
      if (!list.length) {
        const created = await discussionService.createDiscussion("新会话");
        list = [created];
      }
      store.setData(list);
      if (!discussionControlService.getCurrentDiscussionId() && list.length > 0) {
        discussionControlService.setCurrentDiscussionId(list[0].id);
      }
      return list;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : "加载失败");
      return [] as Discussion[];
    }
  };

  create = async (title: string) => {
    const d = await discussionService.createDiscussion(title);
    const list = await this.load();
    if (!list.find((item) => item.id === d.id)) {
      list.unshift(d);
      useDiscussionsStore.getState().setData(list);
    }
    this.select(d.id);
    return d;
  };

  update = async (id: string, data: Partial<Discussion>) => {
    const updated = await discussionService.updateDiscussion(id, data);
    await this.load();
    return updated;
  };

  remove = async (id: string) => {
    await discussionService.deleteDiscussion(id);
    const list = await this.load();
    if (discussionControlService.getCurrentDiscussionId() === id) {
      const next = list[0]?.id ?? null;
      discussionControlService.setCurrentDiscussionId(next);
    }
  };

  select = (id: string | null) => {
    discussionControlService.setCurrentDiscussionId(id);
  };

  clearMessages = async (discussionId: string) => {
    await messageService.clearMessages(discussionId);
    if (discussionControlService.getCurrentDiscussionId() === discussionId) {
      useMessagesStore.getState().setData([], discussionId);
    }
  };

  clearAllMessages = async () => {
    const list = this.getAll();
    await Promise.all(list.map((d) => messageService.clearMessages(d.id)));
    const currentId = discussionControlService.getCurrentDiscussionId();
    if (currentId) {
      useMessagesStore.getState().setData([], currentId);
    }
  };
}
