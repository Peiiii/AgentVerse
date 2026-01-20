import { discussionMemberService } from "@/core/services/discussion-member.service";
import { discussionControlService } from "@/core/services/discussion-control.service";
import type { DiscussionMember } from "@/common/types/discussion-member";
import { useDiscussionMembersStore } from "@/core/stores/discussion-members.store";

export class DiscussionMembersManager {
  constructor() {
    discussionControlService.onCurrentDiscussionIdChange$.listen(() => {
      void this.load();
    });
  }

  load = async (discussionId?: string) => {
    const store = useDiscussionMembersStore.getState();
    store.setLoading(true);
    const currentId = discussionControlService.getCurrentDiscussionId();
    if (discussionId && discussionId !== currentId) {
      store.setData(store.data, store.currentDiscussionId);
      return store.data;
    }
    const id = discussionId ?? currentId;
    if (!id) {
      store.setData([], null);
      return [] as DiscussionMember[];
    }
    try {
      const list = await discussionMemberService.list(id);
      store.setData(list, id);
      return list;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : "加载失败");
      return [] as DiscussionMember[];
    }
  };

  add = async (agentId: string, isAutoReply = false) => {
    const id = discussionControlService.getCurrentDiscussionId();
    if (!id) return null;
    const created = await discussionMemberService.create(id, agentId, isAutoReply);
    await this.load(id);
    return created;
  };

  addMany = async (members: { agentId: string; isAutoReply: boolean }[]) => {
    const id = discussionControlService.getCurrentDiscussionId();
    if (!id) return [] as DiscussionMember[];
    const created = await discussionMemberService.createMany(id, members);
    await this.load(id);
    return created;
  };

  update = async (memberId: string, data: Partial<DiscussionMember>) => {
    const updated = await discussionMemberService.update(memberId, data);
    await this.load();
    return updated;
  };

  remove = async (memberId: string) => {
    await discussionMemberService.delete(memberId);
    await this.load();
  };

  toggleAutoReply = async (memberId: string) => {
    const m = useDiscussionMembersStore.getState().data.find((x) => x.id === memberId);
    if (!m) return null;
    return this.update(memberId, { isAutoReply: !m.isAutoReply });
  };

  getMembersForDiscussion = (discussionId: string) => discussionMemberService.list(discussionId);
}
