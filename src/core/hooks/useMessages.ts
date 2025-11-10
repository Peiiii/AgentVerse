import { useResourceState } from "@/common/lib/resource";
import { messagesResource } from "@/core/resources";
import type { AgentMessage, NormalMessage } from "@/common/types/discussion";
import { usePresenter } from "@/core/presenter";
import { discussionControlService } from "@/core/services/discussion-control.service";

export function useMessages() {
  const state = useResourceState(messagesResource.current);
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
    const currentDiscussionId = discussionControlService.getCurrentDiscussionId();
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
    error: state.error?.message,
    addMessage,
  };
}
