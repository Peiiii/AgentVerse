import { discussionsResource, messagesResource } from "@/core/resources";
import { discussionService } from "@/services/discussion.service";
import { discussionControlService } from "@/services/discussion-control.service";
import { messageService } from "@/services/message.service";
import { Discussion } from "@/common/types/discussion";
import { useMemoizedFn } from "ahooks";
import { useResourceState } from "@/common/lib/resource";
import { useOptimisticUpdate } from "./useOptimisticUpdate";
import { useToast } from "./use-toast";

interface UseDiscussionsProps {
  onChange?: (discussions: Discussion[]) => void;
}

export function useDiscussions({ onChange }: UseDiscussionsProps = {}) {
  const resource = useResourceState(discussionsResource.list);
  const { data: discussions } = resource;
  const { data: currentDiscussion } = useResourceState(discussionsResource.current);
  const { toast } = useToast();

  const withOptimisticUpdate = useOptimisticUpdate(resource, { onChange });

  const createDiscussion = useMemoizedFn(async (title: string) => {
    const newDiscussion = await withOptimisticUpdate(
      // 乐观更新
      (discussions) => [
        ...discussions,
        {
          id: `temp-${Date.now()}`,
          title,
          topic: "",
          status: "paused",
          settings: {
            maxRounds: 10,
            temperature: 0.7,
            interval: 3000,
            moderationStyle: "relaxed",
            focusTopics: [],
            allowConflict: true
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      // API 调用
      () => discussionService.createDiscussion(title)
    );

    // 自动选中新创建的会话
    selectDiscussion(newDiscussion.id);
    return newDiscussion;
  });

  const updateDiscussion = useMemoizedFn((id: string, data: Partial<Discussion>) => {
    return withOptimisticUpdate(
      // 乐观更新
      (discussions) =>
        discussions.map((discussion) =>
          discussion.id === id ? { ...discussion, ...data } : discussion
        ),
      // API 调用
      () => discussionService.updateDiscussion(id, data)
    );
  });

  const deleteDiscussion = useMemoizedFn((id: string) => {
    return withOptimisticUpdate(
      // 乐观更新
      (discussions) => discussions.filter((discussion) => discussion.id !== id),
      // API 调用
      () => discussionService.deleteDiscussion(id)
    );
  });

  const selectDiscussion = useMemoizedFn((id: string | null) => {
    discussionControlService.setCurrentDiscussionId(id);
    // 触发当前会话资源重新加载
    discussionsResource.current.reload();
  });

  const clearMessages = useMemoizedFn(async (discussionId: string) => {
    try {
      await messageService.clearMessages(discussionId);
      // 重新加载当前消息列表
      messagesResource.current.reload();
      toast({
        title: "清空成功",
        description: "已清空所有消息",
      });
    } catch (error) {
      console.error('Error clearing messages:', error);
      toast({
        title: "清空失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    }
  });

  const clearAllMessages = useMemoizedFn(async () => {
    try {
      await Promise.all(discussions.map(discussion => 
        messageService.clearMessages(discussion.id)
      ));
      // 重新加载当前消息列表
      messagesResource.current.reload();
      toast({
        title: "清空成功",
        description: "已清空所有会话的消息",
      });
    } catch (error) {
      console.error('Error clearing all messages:', error);
      toast({
        title: "清空失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    }
  });

  return {
    discussions,
    currentDiscussion,
    isLoading: resource.isLoading,
    error: resource.error,
    createDiscussion,
    updateDiscussion,
    deleteDiscussion,
    selectDiscussion,
    clearMessages,
    clearAllMessages
  };
} 