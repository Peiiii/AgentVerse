import { useAgents } from "@/core/hooks/useAgents";
import { useDiscussions } from "@/core/hooks/useDiscussions";
import { cn } from "@/common/lib/utils";
import { usePresenter } from "@/core/presenter";
import { DEFAULT_DISCUSSION_TITLE } from "@/core/services/common.util";
import { filterNormalMessages } from "@/core/services/message.util";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { DiscussionListHeader } from "./discussion-list-header";
import { DiscussionItem } from "./discussion-item";
import { DiscussionListProps } from "./types";

export function DiscussionList({
  className,
  headerClassName,
  listClassName,
  onSelectDiscussion,
}: DiscussionListProps) {
  const { agents } = useAgents();
  const presenter = usePresenter();
  const {
    discussions,
    currentDiscussion,
    isLoading,
    createDiscussion,
    selectDiscussion,
  } = useDiscussions();

  const handleCreateDiscussion = async () => {
    if (agents.length === 0) return;
    const discussion = await createDiscussion("新的讨论");
    if (discussion) {
      selectDiscussion(discussion.id);
    }
  };

  const messages = presenter.messages.store((s) => s.messages);
  useEffect(() => {
    const normals = filterNormalMessages(messages);
    if (!normals.length) return;
    const cur = presenter.discussions.getCurrent();
    if (cur && cur.title === DEFAULT_DISCUSSION_TITLE) {
      const first = normals[0];
      void presenter.discussions.update(first.discussionId, {
        title: first.content.slice(0, 50),
      });
    }
  }, [messages]);

  // 当当前会话变化时，通知外部（保持兼容）
  useEffect(() => {
    if (currentDiscussion?.id) onSelectDiscussion?.(currentDiscussion.id);
  }, [currentDiscussion?.id]);

  return (
    <div
      className={cn("flex flex-col flex-1 overflow-hidden h-full", className)}
    >
      <DiscussionListHeader
        className={headerClassName}
        isLoading={isLoading}
        disabled={agents.length === 0}
        onCreateDiscussion={handleCreateDiscussion}
      />

      <div
        className={cn("flex-1 min-h-0 overflow-y-auto scrollbar-custom", listClassName)}
      >
        <div className="divide-y divide-border/[0.06]">
          {discussions.map((discussion) => (
            <DiscussionItem
              key={discussion.id}
              discussion={discussion}
              isActive={discussion.id === currentDiscussion?.id}
            />
          ))}
        </div>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <Loader2 className="w-6 h-6 animate-spin text-primary/60" />
          </div>
        )}
      </div>
    </div>
  );
} 
