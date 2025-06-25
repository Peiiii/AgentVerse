import { useAgents } from "@/core/hooks/useAgents";
import { useDiscussions } from "@/core/hooks/useDiscussions";
import { cn } from "@/common/lib/utils";
import { discussionsResource, messagesResource } from "@/core/resources";
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
  const {
    discussions,
    currentDiscussion,
    isLoading,
    createDiscussion,
    selectDiscussion,
    updateDiscussion,
    deleteDiscussion,
  } = useDiscussions();

  const handleCreateDiscussion = async () => {
    if (agents.length === 0) return;
    const discussion = await createDiscussion("新的讨论");
    if (discussion) {
      selectDiscussion(discussion.id);
    }
  };

  useEffect(() => {
    // 监听消息变化并更新标题
    return messagesResource.current.subscribe(async (state) => {
      if (state.data && !state.isValidating && !state.isLoading) {
        const messages = filterNormalMessages(state.data);
        if (messages.length) {
          const discussion = discussionsResource.current.getState().data;
          if (discussion && discussion.title === DEFAULT_DISCUSSION_TITLE) {
            try {
              updateDiscussion(messages[0].discussionId, {
                title: messages[0].content.slice(0, 50),
              });
            } catch (error) {
              console.error("Failed to generate discussion title:", error);
            }
          }
        }
      }
    });
  }, []);

  const handleSelectDiscussion = (discussionId: string) => {
    selectDiscussion(discussionId);
    onSelectDiscussion?.(discussionId);
  };

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
              onClick={() => handleSelectDiscussion(discussion.id)}
              onRename={(title) => updateDiscussion(discussion.id, { title })}
              onDelete={() => deleteDiscussion(discussion.id)}
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