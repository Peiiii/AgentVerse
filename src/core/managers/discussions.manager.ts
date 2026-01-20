import { discussionRepository } from "@/core/repositories/discussion.repository";
import { messageRepository } from "@/core/repositories/message.repository";
import { getPresenter } from "@/core/presenter/presenter";
import type { Discussion } from "@/common/types/discussion";
import { useDiscussionsStore } from "@/core/stores/discussions.store";
import { useMessagesStore } from "@/core/stores/messages.store";

export class DiscussionsManager {
  getAll = () => useDiscussionsStore.getState().data;
  getCurrentId = () => getPresenter().discussionControl.getCurrentDiscussionId();
  getCurrent = () => {
    const id = this.getCurrentId();
    if (!id) return null;
    return this.getAll().find((item) => item.id === id) ?? null;
  };

  load = async () => {
    const store = useDiscussionsStore.getState();
    store.setLoading(true);
    try {
      let list = await discussionRepository.listDiscussions();
      if (!list.length) {
        const created = await discussionRepository.createDiscussion("新会话");
        list = [created];
      }
      store.setData(list);
      if (!getPresenter().discussionControl.getCurrentDiscussionId() && list.length > 0) {
        getPresenter().discussionControl.setCurrentDiscussionId(list[0].id);
      }
      return list;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : "加载失败");
      return [] as Discussion[];
    }
  };

  create = async (title: string) => {
    const d = await discussionRepository.createDiscussion(title);
    const list = await this.load();
    if (!list.find((item) => item.id === d.id)) {
      list.unshift(d);
      useDiscussionsStore.getState().setData(list);
    }
    this.select(d.id);
    return d;
  };

  update = async (id: string, data: Partial<Discussion>) => {
    const updated = await discussionRepository.updateDiscussion(id, data);
    await this.load();
    return updated;
  };

  remove = async (id: string) => {
    await discussionRepository.deleteDiscussion(id);
    const list = await this.load();
    if (getPresenter().discussionControl.getCurrentDiscussionId() === id) {
      const next = list[0]?.id ?? null;
      getPresenter().discussionControl.setCurrentDiscussionId(next);
    }
  };

  select = (id: string | null) => {
    getPresenter().discussionControl.setCurrentDiscussionId(id);
  };

  clearMessages = async (discussionId: string) => {
    await messageRepository.clearMessages(discussionId);
    if (getPresenter().discussionControl.getCurrentDiscussionId() === discussionId) {
      useMessagesStore.getState().setData([], discussionId);
    }
  };

  clearAllMessages = async () => {
    const list = this.getAll();
    await Promise.all(list.map((d) => messageRepository.clearMessages(d.id)));
    const currentId = getPresenter().discussionControl.getCurrentDiscussionId();
    if (currentId) {
      useMessagesStore.getState().setData([], currentId);
    }
  };
}
