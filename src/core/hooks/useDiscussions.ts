import { usePresenter } from "@/core/presenter";

// Thin adapter to new DiscussionsManager + store. Kept for compatibility.
export function useDiscussions() {
  const presenter = usePresenter();
  const discussions = presenter.discussions.store((s) => s.discussions);
  const currentId = presenter.discussions.store((s) => s.currentId);
  const isLoading = presenter.discussions.store((s) => s.isLoading);
  const error = presenter.discussions.store((s) => s.error);

  const currentDiscussion = discussions.find((d) => d.id === currentId) ?? null;

  return {
    discussions,
    currentDiscussion,
    isLoading,
    error,
  };
}
