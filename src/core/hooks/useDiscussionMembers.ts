import { useDiscussionMembersStore } from "@/core/stores/discussion-members.store";

export function useDiscussionMembers() {
  const state = useDiscussionMembersStore();
  return {
    members: state.data,
    isLoading: state.isLoading,
    error: state.error || undefined,
  };
}
