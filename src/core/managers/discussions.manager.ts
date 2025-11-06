import { useDiscussionsStore } from "@/core/stores/discussions.store";
import { discussionService } from "@/core/services/discussion.service";
import { discussionControlService } from "@/core/services/discussion-control.service";
import type { Discussion } from "@/common/types/discussion";
import { messageService } from "@/core/services/message.service";

export class DiscussionsManager {
  store = useDiscussionsStore;

  getAll = () => this.store.getState().discussions;
  getCurrentId = () => this.store.getState().currentId;
  getCurrent = () => {
    const { discussions, currentId } = this.store.getState();
    return discussions.find((d) => d.id === currentId) || null;
  };

  load = async () => {
    const s = this.store.getState();
    s.setLoading(true);
    try {
      const list = await discussionService.listDiscussions();
      s.setDiscussions(list);
      if (!s.currentId && list.length) {
        this.select(list[0].id);
      }
      s.setError(undefined);
    } catch (e) {
      s.setError(e instanceof Error ? e.message : String(e));
    } finally {
      s.setLoading(false);
    }
  };

  create = async (title: string) => {
    const d = await discussionService.createDiscussion(title);
    const { discussions, setDiscussions } = this.store.getState();
    setDiscussions([...discussions, d]);
    this.select(d.id);
    return d;
  };

  update = async (id: string, data: Partial<Discussion>) => {
    const updated = await discussionService.updateDiscussion(id, data);
    const { discussions, setDiscussions } = this.store.getState();
    setDiscussions(discussions.map((it) => (it.id === id ? updated : it)));
    return updated;
  };

  remove = async (id: string) => {
    await discussionService.deleteDiscussion(id);
    const { discussions, setDiscussions, currentId, setCurrentId } = this.store.getState();
    const list = discussions.filter((d) => d.id !== id);
    setDiscussions(list);
    if (currentId === id) {
      const next = list[0]?.id ?? null;
      setCurrentId(next);
      discussionControlService.setCurrentDiscussionId(next);
    }
  };

  select = (id: string | null) => {
    this.store.getState().setCurrentId(id);
    discussionControlService.setCurrentDiscussionId(id);
  };

  clearMessages = async (discussionId: string) => {
    await messageService.clearMessages(discussionId);
    // leave messages store to reload by subscriber
  };

  clearAllMessages = async () => {
    const list = this.getAll();
    await Promise.all(list.map((d) => messageService.clearMessages(d.id)));
  };
}
