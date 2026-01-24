import { AgentMessage, Discussion } from "@/common/types/discussion";
import { DiscussionDataProvider } from "@/common/types/storage";
import { dataProviders } from "@/core/repositories/data-providers";

export class DiscussionRepository {
  constructor(private readonly provider: DiscussionDataProvider) {}

  async listDiscussions(): Promise<Discussion[]> {
    return this.provider.list();
  }

  async getDiscussion(id: string): Promise<Discussion> {
    return this.provider.get(id);
  }

  async createDiscussion(title: string): Promise<Discussion> {
    const discussion: Omit<Discussion, "id"> = {
      title,
      topic: "",
      status: "paused",
      settings: {
        maxRounds: 20,
        temperature: 0.7,
        interval: 3000,
        moderationStyle: "relaxed",
        focusTopics: [],
        allowConflict: true,
        toolPermissions: {
          moderator: true,
          participant: false,
        },
      },
      note: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.provider.create(discussion);
  }

  async updateDiscussion(
    id: string,
    data: Partial<Discussion>
  ): Promise<Discussion> {
    return this.provider.update(id, data);
  }

  async updateLastMessage(
    id: string,
    message: AgentMessage
  ): Promise<Discussion> {
    const payload: Partial<Discussion> = {
      lastMessageTime: message.timestamp,
      updatedAt: new Date(),
    };
    if (message.type === "text") {
      payload.lastMessage = message.content;
    }
    return this.provider.update(id, payload);
  }

  async deleteDiscussion(id: string): Promise<void> {
    return this.provider.delete(id);
  }
}

export const discussionRepository = new DiscussionRepository(
  dataProviders.discussions as DiscussionDataProvider
);
