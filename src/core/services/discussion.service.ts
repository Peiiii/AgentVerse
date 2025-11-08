import { STORAGE_CONFIG } from "@/core/config/storage";
import { MockHttpProvider } from "@/common/lib/storage";
import { AgentMessage, Discussion } from "@/common/types/discussion";
import { DiscussionDataProvider } from "@/common/types/storage";

export class DiscussionService {
  constructor(private provider: DiscussionDataProvider) {}

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
    return this.provider.update(id, {
      lastMessageTime: message.timestamp,
      lastMessage: message.type === "text" ? message.content : undefined,
      updatedAt: new Date(),
    });
  }

  async deleteDiscussion(id: string): Promise<void> {
    return this.provider.delete(id);
  }
}

// 创建服务实例
export const discussionService = new DiscussionService(
  new MockHttpProvider<Discussion>(STORAGE_CONFIG.KEYS.DISCUSSIONS, {
    delay: STORAGE_CONFIG.MOCK_DELAY_MS,
    maxItems: 1000,
    // 使用多字段排序
    comparator: (a, b) => {
      return (
        new Date(b.lastMessageTime || b.createdAt).getTime() -
        new Date(a.lastMessageTime || a.createdAt).getTime()
      );
    },
    // sortFields: [
    //   {
    //     field: "lastMessageTime",
    //     // 自定义比较器处理 undefined 情况
    //     comparator: (a?: Date, b?: Date) => {
    //       const timeA = (a ? new Date(a).getTime() : Infinity) as number;
    //       const timeB = (b ? new Date(b).getTime() : Infinity) as number;
    //       return timeB - timeA;
    //     },
    //   } as SortField<Discussion, "lastMessageTime">,
    // ],
  })
);
