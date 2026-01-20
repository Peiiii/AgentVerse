import { discussionMemberRepository } from "@/core/repositories/discussion-member.repository";
import { getPresenter } from "@/core/presenter/presenter";
import type { DiscussionControlManager } from "@/core/managers/discussion-control.manager";
import type { DiscussionMember } from "@/common/types/discussion-member";
import { useDiscussionMembersStore } from "@/core/stores/discussion-members.store";

export class DiscussionMembersManager {
  private subscribed = false;
  private control: DiscussionControlManager | null = null;

  init(control: DiscussionControlManager) {
    if (this.subscribed) return;
    this.control = control;
    this.subscribed = true;
    control.onCurrentDiscussionIdChange$.listen(() => {
      void this.load();
    });
  }

  private getControl() {
    return this.control ?? getPresenter().discussionControl;
  }

  load = async (discussionId?: string) => {
    if (!this.subscribed) {
      this.init(this.getControl());
    }
    const store = useDiscussionMembersStore.getState();
    store.setLoading(true);
    const currentId = this.getControl().getCurrentDiscussionId();
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
      const list = await discussionMemberRepository.list(id);
      store.setData(list, id);
      return list;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : "加载失败");
      return [] as DiscussionMember[];
    }
  };

  add = async (agentId: string, isAutoReply = false) => {
    const id = this.getControl().getCurrentDiscussionId();
    if (!id) return null;
    const created = await discussionMemberRepository.create(id, agentId, isAutoReply);
    await this.load(id);
    return created;
  };

  addMany = async (members: { agentId: string; isAutoReply: boolean }[]) => {
    const id = this.getControl().getCurrentDiscussionId();
    if (!id) return [] as DiscussionMember[];
    const created = await discussionMemberRepository.createMany(id, members);
    await this.load(id);
    return created;
  };

  update = async (memberId: string, data: Partial<DiscussionMember>) => {
    if (!this.subscribed) {
      this.init(this.getControl());
    }
    const updated = await discussionMemberRepository.update(memberId, data);
    await this.load();
    return updated;
  };

  remove = async (memberId: string) => {
    if (!this.subscribed) {
      this.init(this.getControl());
    }
    await discussionMemberRepository.delete(memberId);
    await this.load();
  };

  toggleAutoReply = async (memberId: string) => {
    if (!this.subscribed) {
      this.init(this.getControl());
    }
    const m = useDiscussionMembersStore.getState().data.find((x) => x.id === memberId);
    if (!m) return null;
    return this.update(memberId, { isAutoReply: !m.isAutoReply });
  };

  getMembersForDiscussion = (discussionId: string) => {
    if (!this.subscribed) {
      this.init(this.getControl());
    }
    return discussionMemberRepository.list(discussionId);
  };
}
