import { useMemo } from "react";
import { useDiscussionsStore } from "@/core/stores/discussions.store";
import { useCurrentDiscussionId } from "@/core/hooks/useCurrentDiscussionId";

export function useDiscussions() {
  const { data, isLoading, error } = useDiscussionsStore();
  const currentId = useCurrentDiscussionId();
  const currentDiscussion = useMemo(() => {
    if (!currentId) return null;
    return data.find((item) => item.id === currentId) ?? null;
  }, [data, currentId]);
  return {
    discussions: data,
    currentDiscussion,
    isLoading,
    error: error || undefined,
  };
}
