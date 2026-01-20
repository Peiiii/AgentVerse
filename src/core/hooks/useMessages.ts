import type { AgentMessage, NormalMessage } from "@/common/types/discussion";
import { usePresenter } from "@/core/presenter";
import { useMessagesStore } from "@/core/stores/messages.store";

export function useMessages() {
  const state = useMessagesStore();
  const presenter = usePresenter();

  const addMessage = async ({
    content,
    agentId,
    type = "text" as AgentMessage["type"],
    replyTo,
  }: {
    content: string;
    agentId: string;
    type?: AgentMessage["type"];
    replyTo?: string;
  }) => {
    const currentDiscussionId = presenter.discussions.getCurrentId();
    if (!currentDiscussionId) return;
    return presenter.messages.add(currentDiscussionId, {
      content,
      agentId,
      type,
      replyTo,
      timestamp: new Date(),
    } as Omit<NormalMessage, "id" | "discussionId">);
  };

  return {
    messages: state.data,
    isLoading: state.isLoading,
    error: state.error || undefined,
    addMessage,
  };
}
