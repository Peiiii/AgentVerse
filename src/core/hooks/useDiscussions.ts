import { useResourceState } from "@/common/lib/resource";
import { discussionsResource } from "@/core/resources";

export function useDiscussions() {
  const listState = useResourceState(discussionsResource.list);
  const currentState = useResourceState(discussionsResource.current);
  return {
    discussions: listState.data,
    currentDiscussion: currentState.data,
    isLoading: listState.isLoading || currentState.isLoading,
    error: listState.error?.message || currentState.error?.message,
  };
}
