import { useMessagesStore } from "@/core/stores/messages.store";
import { messageService } from "@/core/services/message.service";
import type { AgentMessage } from "@/common/types/discussion";

export class MessagesManager {
  store = useMessagesStore;

  loadForDiscussion = async (discussionId: string) => {
    const s = this.store.getState();
    s.setLoading(true);
    try {
      const list = await messageService.listMessages(discussionId);
      s.setMessages(list);
      s.setError(undefined);
    } catch (e) {
      s.setError(e instanceof Error ? e.message : String(e));
    } finally {
      s.setLoading(false);
    }
  };

  add = async (discussionId: string, message: Omit<AgentMessage, "id" | "discussionId">) => {
    const created = await messageService.addMessage(discussionId, message);
    const { messages, setMessages } = this.store.getState();
    setMessages([...messages, created]);
    // discussionService.updateLastMessage already done inside service
    return created;
  };

  create = async (message: Omit<AgentMessage, "id">) => {
    const created = await messageService.createMessage(message);
    const { messages, setMessages } = this.store.getState();
    if (created.discussionId === message.discussionId) {
      setMessages([...messages, created]);
    }
    return created;
  };

  update = async (id: string, updates: Partial<AgentMessage>) => {
    const updated = await messageService.updateMessage(id, updates);
    const { messages, setMessages } = this.store.getState();
    setMessages(messages.map((m) => (m.id === id ? updated : m)));
    return updated;
  };

  remove = async (id: string) => {
    await messageService.deleteMessage(id);
    const { messages, setMessages } = this.store.getState();
    setMessages(messages.filter((m) => m.id !== id));
  };

  clearForDiscussion = async (discussionId: string) => {
    await messageService.clearMessages(discussionId);
    this.store.getState().setMessages([]);
  };
}
