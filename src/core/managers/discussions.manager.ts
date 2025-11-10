import { discussionService } from "@/core/services/discussion.service";
import { discussionControlService } from "@/core/services/discussion-control.service";
import type { Discussion } from "@/common/types/discussion";
import { messageService } from "@/core/services/message.service";
import { discussionsResource, messagesResource } from "@/core/resources";

export class DiscussionsManager {
  // Reads are resource-first; helper getters use resource state to avoid suspense throw
  getAll = () => (discussionsResource.list.getState().data ?? []) as Discussion[];
  getCurrentId = () => discussionControlService.getCurrentDiscussionId();
  getCurrent = () => discussionsResource.current.getState().data ?? null;

  load = async () => {
    await discussionsResource.list.reload();
  };

  create = async (title: string) => {
    const d = await discussionService.createDiscussion(title);
    await discussionsResource.list.reload();
    this.select(d.id);
    return d;
  };

  update = async (id: string, data: Partial<Discussion>) => {
    const updated = await discussionService.updateDiscussion(id, data);
    await discussionsResource.list.reload();
    return updated;
  };

  remove = async (id: string) => {
    await discussionService.deleteDiscussion(id);
    await discussionsResource.list.reload();
    if (discussionControlService.getCurrentDiscussionId() === id) {
      const next = (discussionsResource.list.getState().data ?? [])[0]?.id ?? null;
      discussionControlService.setCurrentDiscussionId(next);
    }
  };

  select = (id: string | null) => {
    discussionControlService.setCurrentDiscussionId(id);
    // Messages resource listens to id changes and will reload itself
  };

  clearMessages = async (discussionId: string) => {
    await messageService.clearMessages(discussionId);
    if (discussionControlService.getCurrentDiscussionId() === discussionId) {
      await messagesResource.current.reload();
    }
  };

  clearAllMessages = async () => {
    const list = (discussionsResource.list.getState().data ?? []) as Discussion[];
    await Promise.all(list.map((d) => messageService.clearMessages(d.id)));
    await messagesResource.current.reload();
  };
}
