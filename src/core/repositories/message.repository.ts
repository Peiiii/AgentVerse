import { AgentMessage } from "@/common/types/discussion";
import { MessageDataProvider } from "@/common/types/storage";
import { dataProviders } from "@/core/repositories/data-providers";
import { discussionRepository } from "@/core/repositories/discussion.repository";

export class MessageRepository {
  constructor(private readonly provider: MessageDataProvider) {}

  async listMessages(discussionId: string): Promise<AgentMessage[]> {
    const messages = await this.provider.list();
    return messages
      .filter((msg) => msg.discussionId === discussionId)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
  }

  async getMessage(id: string): Promise<AgentMessage> {
    return this.provider.get(id);
  }

  async addMessage(
    discussionId: string,
    message: Omit<AgentMessage, "id" | "discussionId">
  ): Promise<AgentMessage> {
    const newMessage = await this.provider.create({
      ...message,
      discussionId,
      timestamp: new Date(),
    });

    await discussionRepository.updateLastMessage(discussionId, newMessage);

    return newMessage;
  }

  async createMessage(data: Omit<AgentMessage, "id">): Promise<AgentMessage> {
    const newMessage = await this.provider.create(data);

    await discussionRepository.updateLastMessage(newMessage.discussionId, newMessage);

    return newMessage;
  }

  async updateMessage(
    id: string,
    data: Partial<AgentMessage>
  ): Promise<AgentMessage> {
    const updatedMessage = await this.provider.update(id, data);
    await discussionRepository.updateLastMessage(
      updatedMessage.discussionId,
      updatedMessage
    );
    return updatedMessage;
  }

  async deleteMessage(id: string): Promise<void> {
    return this.provider.delete(id);
  }

  async clearMessages(discussionId: string): Promise<void> {
    const messages = await this.listMessages(discussionId);
    await Promise.all(messages.map((message) => this.deleteMessage(message.id)));
  }
}

export const messageRepository = new MessageRepository(
  dataProviders.messages as MessageDataProvider
);
