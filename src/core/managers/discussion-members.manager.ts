import { discussionMemberService } from "@/core/services/discussion-member.service";
import { discussionControlService } from "@/core/services/discussion-control.service";
import type { DiscussionMember } from "@/common/types/discussion-member";
import { discussionMembersResource } from "@/core/resources";

export class DiscussionMembersManager {
  load = async (discussionId?: string) => {
    const id = discussionId ?? discussionControlService.getCurrentDiscussionId();
    if (!id) {
      await discussionMembersResource.current.reload();
      return [] as DiscussionMember[]; // no current discussion
    }
    const list = await discussionMemberService.list(id);
    await discussionMembersResource.current.reload();
    return list;
  };

  add = async (agentId: string, isAutoReply = false) => {
    const id = discussionControlService.getCurrentDiscussionId();
    if (!id) return null;
    const created = await discussionMemberService.create(id, agentId, isAutoReply);
    await discussionMembersResource.current.reload();
    return created;
  };

  addMany = async (members: { agentId: string; isAutoReply: boolean }[]) => {
    const id = discussionControlService.getCurrentDiscussionId();
    if (!id) return [] as DiscussionMember[];
    const created = await discussionMemberService.createMany(id, members);
    await discussionMembersResource.current.reload();
    return created;
  };

  update = async (memberId: string, data: Partial<DiscussionMember>) => {
    const updated = await discussionMemberService.update(memberId, data);
    await discussionMembersResource.current.reload();
    return updated;
  };

  remove = async (memberId: string) => {
    await discussionMemberService.delete(memberId);
    await discussionMembersResource.current.reload();
  };

  toggleAutoReply = async (memberId: string) => {
    const m = (discussionMembersResource.current.getState().data ?? []).find((x) => x.id === memberId);
    if (!m) return null;
    return this.update(memberId, { isAutoReply: !m.isAutoReply });
  };

  getMembersForDiscussion = (discussionId: string) => discussionMemberService.list(discussionId);
}
