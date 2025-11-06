import { usePresenter } from "@/core/presenter";

export function useDiscussionMembers() {
  const presenter = usePresenter();
  const members = presenter.discussionMembers.store((s) => s.members);
  const isLoading = presenter.discussionMembers.store((s) => s.isLoading);
  const error = presenter.discussionMembers.store((s) => s.error);

  return {
    members,
    isLoading,
    error,
  };
}
