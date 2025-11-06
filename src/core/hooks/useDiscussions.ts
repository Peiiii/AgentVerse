import { usePresenter } from "@/core/presenter";
import type { Discussion } from "@/common/types/discussion";
import { useToast } from "./use-toast";

interface UseDiscussionsProps {
  onChange?: (discussions: Discussion[]) => void;
}

// Thin adapter to new DiscussionsManager + store. Kept for compatibility.
export function useDiscussions(_opts: UseDiscussionsProps = {}) {
  const presenter = usePresenter();
  const { toast } = useToast();
  const discussions = presenter.discussions.store((s) => s.discussions);
  const currentId = presenter.discussions.store((s) => s.currentId);
  const isLoading = presenter.discussions.store((s) => s.isLoading);
  const error = presenter.discussions.store((s) => s.error);

  const currentDiscussion = discussions.find((d) => d.id === currentId) ?? null;

  const clearMessages = async (discussionId: string) => {
    try {
      await presenter.discussions.clearMessages(discussionId);
      toast({ title: "清空成功", description: "已清空所有消息" });
    } catch (error) {
      console.error("Error clearing messages:", error);
      toast({
        title: "清空失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    }
  };

  const clearAllMessages = async () => {
    try {
      await presenter.discussions.clearAllMessages();
      toast({ title: "清空成功", description: "已清空所有会话的消息" });
    } catch (error) {
      console.error("Error clearing all messages:", error);
      toast({
        title: "清空失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    }
  };

  return {
    discussions,
    currentDiscussion,
    isLoading,
    error,
    createDiscussion: presenter.discussions.create,
    updateDiscussion: presenter.discussions.update,
    deleteDiscussion: presenter.discussions.remove,
    selectDiscussion: presenter.discussions.select,
    clearMessages,
    clearAllMessages,
  };
}
