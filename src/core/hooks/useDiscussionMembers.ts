import { usePresenter } from "@/core/presenter";
import type { DiscussionMember } from "@/common/types/discussion-member";
import { useCallback } from "react";

interface UseDiscussionMembersProps {
  onChange?: (members: DiscussionMember[]) => void;
}

export function useDiscussionMembers(_opts: UseDiscussionMembersProps = {}) {
  const presenter = usePresenter();
  const members = presenter.discussionMembers.store((s) => s.members);
  const isLoading = presenter.discussionMembers.store((s) => s.isLoading);
  const error = presenter.discussionMembers.store((s) => s.error);

  const getMembersForDiscussion = useCallback((discussionId: string) => {
    return presenter.discussionMembers.getMembersForDiscussion(discussionId);
  }, [presenter]);

  return {
    members,
    isLoading,
    error,
    addMember: presenter.discussionMembers.add,
    addMembers: presenter.discussionMembers.addMany,
    updateMember: presenter.discussionMembers.update,
    removeMember: presenter.discussionMembers.remove,
    toggleAutoReply: presenter.discussionMembers.toggleAutoReply,
    getMembersForDiscussion,
  };
}
