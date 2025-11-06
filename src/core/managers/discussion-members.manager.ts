import { useDiscussionMembersStore } from "@/core/stores/discussion-members.store";
import { discussionMemberService } from "@/core/services/discussion-member.service";
import { discussionControlService } from "@/core/services/discussion-control.service";
import type { DiscussionMember } from "@/common/types/discussion-member";

export class DiscussionMembersManager {
  store = useDiscussionMembersStore;

  load = async (discussionId?: string) => {
    const id = discussionId ?? discussionControlService.getCurrentDiscussionId();
    if (!id) {
      this.store.getState().setMembers([]);
      return [] as DiscussionMember[];
    }
    const s = this.store.getState();
    s.setLoading(true);
    try {
      const list = await discussionMemberService.list(id);
      s.setMembers(list);
      s.setError(undefined);
      return list;
    } catch (e) {
      s.setError(e instanceof Error ? e.message : String(e));
      return [] as DiscussionMember[];
    } finally {
      s.setLoading(false);
    }
  };

  add = async (agentId: string, isAutoReply = false) => {
    const id = discussionControlService.getCurrentDiscussionId();
    if (!id) return null;
    const created = await discussionMemberService.create(id, agentId, isAutoReply);
    const { members, setMembers } = this.store.getState();
    setMembers([...members, created]);
    return created;
  };

  addMany = async (members: { agentId: string; isAutoReply: boolean }[]) => {
    const id = discussionControlService.getCurrentDiscussionId();
    if (!id) return [] as DiscussionMember[];
    const created = await discussionMemberService.createMany(id, members);
    const state = this.store.getState();
    state.setMembers([...state.members, ...created]);
    return created;
  };

  update = async (memberId: string, data: Partial<DiscussionMember>) => {
    const updated = await discussionMemberService.update(memberId, data);
    const state = this.store.getState();
    state.setMembers(state.members.map((m) => (m.id === memberId ? updated : m)));
    return updated;
  };

  remove = async (memberId: string) => {
    await discussionMemberService.delete(memberId);
    const state = this.store.getState();
    state.setMembers(state.members.filter((m) => m.id !== memberId));
  };

  toggleAutoReply = async (memberId: string) => {
    const m = this.store.getState().members.find((x) => x.id === memberId);
    if (!m) return null;
    return this.update(memberId, { isAutoReply: !m.isAutoReply });
  };

  getMembersForDiscussion = (discussionId: string) => discussionMemberService.list(discussionId);
}

