import { usePresenter } from "@/core/presenter";
import { AgentMessage, NormalMessage } from "@/common/types/discussion";

export function useMessages() {
  const presenter = usePresenter();
  const messages = presenter.messages.store((s) => s.messages);
  const isLoading = presenter.messages.store((s) => s.isLoading);
  const error = presenter.messages.store((s) => s.error);
  const currentDiscussionId = presenter.discussions.store((s) => s.currentId);

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
    messages,
    isLoading,
    error,
    addMessage,
  };
}
