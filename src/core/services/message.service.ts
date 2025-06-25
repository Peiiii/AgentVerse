import { STORAGE_CONFIG } from "@/config/storage";
import { MockHttpProvider } from "@/common/lib/storage";
import { AgentMessage } from "@/common/types/discussion";
import { MessageDataProvider } from "@/common/types/storage";
import { discussionService } from "./discussion.service";

export class MessageService {
  constructor(private readonly provider: MessageDataProvider) {}

  async listMessages(discussionId: string): Promise<AgentMessage[]> {
    const messages = await this.provider.list();
    return messages
      .filter(msg => msg.discussionId === discussionId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async getMessage(id: string): Promise<AgentMessage> {
    return this.provider.get(id);
  }

  async addMessage(discussionId: string, message: Omit<AgentMessage, "id" | "discussionId">): Promise<AgentMessage> {
    const newMessage = await this.provider.create({
      ...message,
      discussionId,
      timestamp: new Date(),
    });

    // 更新会话的最新消息时间
    await discussionService.updateLastMessage(discussionId, newMessage);

    return newMessage;
  }

  async createMessage(data: Omit<AgentMessage, "id">): Promise<AgentMessage> {
    const newMessage = await this.provider.create(data);
    
    // 更新会话的最新消息时间
    await discussionService.updateLastMessage(newMessage.discussionId, newMessage);
    
    return newMessage;
  }

  async updateMessage(id: string, data: Partial<AgentMessage>): Promise<AgentMessage> {
    const updatedMessage = await this.provider.update(id, data);
    await discussionService.updateLastMessage(updatedMessage.discussionId, updatedMessage);
    return updatedMessage;
  }

  async deleteMessage(id: string): Promise<void> {
    return this.provider.delete(id);
  }

  async clearMessages(discussionId: string): Promise<void> {
    const messages = await this.listMessages(discussionId);
    await Promise.all(messages.map(message => this.deleteMessage(message.id)));
  }
}

// 创建服务实例
export const messageService = new MessageService(
  new MockHttpProvider<AgentMessage>(
    STORAGE_CONFIG.KEYS.MESSAGES,
    {
      delay: STORAGE_CONFIG.MOCK_DELAY_MS,
    }
  )
); 