import { useResourceState } from "@/common/lib/resource";
import { discussionMembersResource } from "@/core/resources";

export function useDiscussionMembers() {
  const state = useResourceState(discussionMembersResource.current);
  return {
    members: state.data,
    isLoading: state.isLoading,
    error: state.error?.message,
  };
}
