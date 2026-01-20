import { DiscussionMember } from "@/common/types/discussion-member";
import { DiscussionMemberDataProvider } from "@/common/types/storage";
import { dataProviders } from "./data-providers";
import { nanoid } from "nanoid";

class DiscussionMemberError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DiscussionMemberError';
  }
}

export class DiscussionMemberService {
  constructor(private provider: DiscussionMemberDataProvider) {}

  async list(discussionId: string): Promise<DiscussionMember[]> {
    const members = await this.provider.list();
    return members.filter((member) => member.discussionId === discussionId);
  }

  private async checkAgentExists(discussionId: string, agentId: string): Promise<boolean> {
    const members = await this.list(discussionId);
    return members.some(member => member.agentId === agentId);
  }

  async create(
    discussionId: string,
    agentId: string,
    isAutoReply: boolean = false
  ): Promise<DiscussionMember> {
    // 检查 agentId 是否已存在
    const exists = await this.checkAgentExists(discussionId, agentId);
    if (exists) {
      throw new DiscussionMemberError(`Agent ${agentId} 已经在讨论 ${discussionId} 中`);
    }

    const member: DiscussionMember = {
      id: nanoid(),
      discussionId,
      agentId,
      isAutoReply,
      joinedAt: new Date().toISOString(),
    };
    return this.provider.create(member);
  }

  async createMany(
    discussionId: string,
    members: { agentId: string; isAutoReply: boolean }[]
  ): Promise<DiscussionMember[]> {
    // 检查是否有重复的 agentId
    const uniqueAgentIds = new Set(members.map(m => m.agentId));
    if (uniqueAgentIds.size !== members.length) {
      throw new DiscussionMemberError('成员列表中存在重复的 Agent');
    }

    // 检查每个 agentId 是否已存在于讨论中
    const existingMembers = await this.list(discussionId);
    const existingAgentIds = new Set(existingMembers.map(m => m.agentId));
    
    const duplicateAgents = members.filter(m => existingAgentIds.has(m.agentId));
    if (duplicateAgents.length > 0) {
      throw new DiscussionMemberError(
        `以下 Agent 已经在讨论中: ${duplicateAgents.map(m => m.agentId).join(', ')}`
      );
    }

    const memberData = members.map(member => ({
      id: nanoid(),
      discussionId,
      agentId: member.agentId,
      isAutoReply: member.isAutoReply,
      joinedAt: new Date().toISOString(),
    }));
    return this.provider.createMany(memberData);
  }

  async update(
    memberId: string,
    data: Partial<DiscussionMember>
  ): Promise<DiscussionMember> {
    return this.provider.update(memberId, data);
  }

  async delete(memberId: string): Promise<void> {
    return this.provider.delete(memberId);
  }
}

export const discussionMemberService = new DiscussionMemberService(
  dataProviders.discussionMembers as DiscussionMemberDataProvider
);
