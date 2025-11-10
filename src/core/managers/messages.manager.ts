import { messageService } from "@/core/services/message.service";
import type { AgentMessage, NormalMessage } from "@/common/types/discussion";
import { messagesResource } from "@/core/resources";

export class MessagesManager {
  // Resource-first reads; writes refresh resource

  loadForDiscussion = async () => {
    await messagesResource.current.reload();
  };

  add = async (discussionId: string, message: Omit<NormalMessage, "id" | "discussionId">) => {
    const created = await messageService.addMessage(discussionId, message);
    await messagesResource.current.reload();
    // discussionService.updateLastMessage already done inside service
    return created;
  };

  create = async (message: Omit<AgentMessage, "id">) => {
    const created = await messageService.createMessage(message);
    await messagesResource.current.reload();
    return created;
  };

  update = async (id: string, updates: Partial<AgentMessage>) => {
    const updated = await messageService.updateMessage(id, updates);
    await messagesResource.current.reload();
    return updated;
  };

  remove = async (id: string) => {
    await messageService.deleteMessage(id);
    await messagesResource.current.reload();
  };

  clearForDiscussion = async (discussionId: string) => {
    await messageService.clearMessages(discussionId);
    await messagesResource.current.reload();
  };
}
