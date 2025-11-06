import { AutoResizeTextarea } from "@/common/components/ui/auto-resize-textarea";
import { MentionSuggestions } from "./mention-suggestions";
import { useMention } from "@/common/hooks/use-mention";
import { useMentionPosition } from "@/common/hooks/use-mention-position";
import { useAgents } from "@/core/hooks/useAgents";
import { usePresenter } from "@/core/presenter";
import { useDiscussionMembers } from "@/core/hooks/useDiscussionMembers";
import { cn } from "@/common/lib/utils";
import { forwardRef, useMemo } from "react";
import { useMessageInput, type MessageInputRef } from "@/core/hooks/useMessageInput";

/**
 * 微信PC端消息输入框设计：
 * +---------------------------------------------------------------+
 * |                                                               |
 * |  +---------------------------------------------------+        |
 * |  |                                                   |        |
 * |  |  在这里输入消息...                                |        |
 * |  |                                                   |        |
 * |  |                                                   |        |
 * |  |                                                   |        |
 * |  +---------------------------------------------------+        |
 * |                                                               |
 * +---------------------------------------------------------------+
 */

interface MessageInputProps {
  className?: string;
}

export const MessageInputDesktop = forwardRef<MessageInputRef, MessageInputProps>(
  function MessageInputDesktop({ className }, ref) {
    const presenter = usePresenter();
    const currentDiscussionId = presenter.discussions.store((s) => s.currentId);
    const {
      input,
      setInput,
      isLoading,
      inputRef,
      handleKeyDown: baseHandleKeyDown
    } = useMessageInput({
      onSendMessage: async (content: string, agentId: string) => {
        if (!currentDiscussionId) return;
        const agentMessage = await presenter.messages.add(currentDiscussionId, {
          content,
          agentId,
          type: "text",
          timestamp: new Date(),
        });
        console.log("[message-input-desktop] handleSendMessage after add message", agentMessage);
        if (agentMessage) await presenter.discussionControl.process(agentMessage);
      },
      forwardedRef: ref
    });

    const { agents } = useAgents();
    const { members } = useDiscussionMembers();

    const mentionAgents = useMemo(() => 
      agents.filter((agent) => 
        members.some((member) => member.agentId === agent.id)
      ),
      [agents, members]
    );

    const getAgentName = useMemo(() => (agentId: string) => {
      if (agentId === "user") return "我";
      return agents.find((a) => a.id === agentId)?.name ?? "未知";
    }, [agents]);

    const getAgentAvatar = useMemo(() => (agentId: string) => {
      return agents.find((a) => a.id === agentId)?.avatar ?? "";
    }, [agents]);

    const {
      mentionState,
      filteredAgents,
      selectedIndex,
      selectMention,
      handleKeyDown: mentionHandleKeyDown,
      handleInputChange,
    } = useMention({
      value: input,
      onChange: setInput,
      agents: mentionAgents,
      getAgentName,
      inputRef,
    });

    const mentionPosition = useMentionPosition({
      isActive: mentionState?.isActive ?? false,
      startIndex: mentionState?.startIndex ?? 0,
      value: input,
      inputRef,
    });

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (mentionState?.isActive) {
        mentionHandleKeyDown(e);
        if (e.defaultPrevented) {
          return;
        }
      }
      baseHandleKeyDown(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      handleInputChange(e.target.value);
    };

    return (
      <div className={cn("relative bg-white dark:bg-gray-800 rounded-md", className)}>
        <div className="p-3">
          <AutoResizeTextarea
            ref={inputRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="在这里输入消息... (输入 @ 可以提及成员)"
            className="w-full resize-none text-sm outline-none border-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-none focus-visible:shadow-none shadow-none bg-transparent text-gray-900 dark:text-gray-100"
            disabled={isLoading}
            minRows={2}
            maxRows={6}
          />
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-right">
            按 Enter 键发送，按 Shift+Enter 键换行
          </div>
        </div>
        <MentionSuggestions
          agents={filteredAgents}
          selectedIndex={selectedIndex}
          onSelect={selectMention}
          getAgentName={getAgentName}
          getAgentAvatar={getAgentAvatar}
          position={mentionPosition}
          placement="top"
        />
      </div>
    );
  }
); 
