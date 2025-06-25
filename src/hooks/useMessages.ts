import { useResourceState } from "@/common/lib/resource";
import { messagesResource } from "@/resources";
import { discussionControlService } from "@/services/discussion-control.service";
import { messageService } from "@/services/message.service";
import { AgentMessage, NormalMessage } from "@/types/discussion";
import { useMemoizedFn } from "ahooks";
import { nanoid } from "nanoid";
import { useProxyBeanState } from "packages/rx-nested-bean/src";
import { useOptimisticUpdate } from "./useOptimisticUpdate";

export function useMessages() {
  const resourceState = useResourceState(messagesResource.current);
  const { data: currentDiscussionId } = useProxyBeanState(
    discussionControlService.store,
    "currentDiscussionId"
  );

  const withOptimisticUpdate = useOptimisticUpdate(resourceState);

  const addMessage = useMemoizedFn(
    async ({
      content,
      agentId,
      type = "text",
      replyTo,
    }: {
      content: string;
      agentId: string;
      type?: AgentMessage["type"];
      replyTo?: string;
    }) => {
      if (!currentDiscussionId) return;

      const tempId = nanoid();
      const timestamp = new Date();

      return withOptimisticUpdate(
        // 乐观更新
        (messages) => [
          ...messages,
          {
            id: tempId,
            content,
            agentId,
            type,
            replyTo,
            timestamp,
            discussionId: currentDiscussionId,
          } as NormalMessage,
        ],
        // API 调用
        () =>
          messageService.addMessage(currentDiscussionId, {
            content,
            agentId,
            type,
            replyTo,
            timestamp,
          } as Omit<NormalMessage, "id" | "discussionId">)
      );
    }
  );

  return {
    messages: resourceState.data,
    isLoading: resourceState.isLoading,
    error: resourceState.error,
    addMessage,
  };
}
