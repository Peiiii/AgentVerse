import { Button } from "@/common/components/ui/button";
import { AutoResizeTextarea } from "@/common/components/ui/auto-resize-textarea";
import { MentionSuggestions } from "./mention-suggestions";
import { useMention } from "@/common/hooks/use-mention";
import { useMentionPosition } from "@/common/hooks/use-mention-position";
import { useAgents } from "@/core/hooks/useAgents";
import { useDiscussionMembers } from "@/core/hooks/useDiscussionMembers";
import { cn } from "@/common/lib/utils";
import { Send } from "lucide-react";
import { forwardRef } from "react";
import { useMessageInput, type MessageInputRef } from "@/core/hooks/useMessageInput";
import { usePresenter } from "@/core/presenter";
import { useTranslation } from "@/core/hooks/use-i18n";

/**
 * 微信移动端消息输入框设计（简化版）：
 * +-----------------------------------------------+
 * |                                               |
 * | +-------------------------------------------+ |
 * | | 在这里输入消息...                   [发送] | |
 * | +-------------------------------------------+ |
 * |                                               |
 * +-----------------------------------------------+
 */

interface MessageInputProps {
  className?: string;
  isFirstMessage?: boolean;
}

export const MessageInputMobile = forwardRef<MessageInputRef, MessageInputProps>(
  function MessageInputMobile({ className }, ref) {
    const presenter = usePresenter();
    const isAgentResponding = presenter.discussionControl.getSnapshot().currentSpeakerId !== null;

    const {
      input,
      setInput,
      isLoading,
      inputRef,
      canSubmit,
      handleSubmit,
      handleKeyDown: baseHandleKeyDown
    } = useMessageInput({
      onSendMessage: async (content: string, agentId: string) => {
        const currentId = presenter.discussionControl.getCurrentDiscussionId();
        if (!currentId) return;
        const agentMessage = await presenter.messages.add(currentId, {
          content,
          agentId,
          type: "text",
          timestamp: new Date(),
        });
        if (agentMessage) await presenter.discussionControl.process(agentMessage);
      },
      forwardedRef: ref
    });

    const { agents } = useAgents();
    const { members } = useDiscussionMembers();

    const mentionAgents = agents.filter((agent) => 
      members.some((member) => member.agentId === agent.id)
    );

    const { t } = useTranslation();
    const getAgentName = (agentId: string) => {
      if (agentId === "user") return t("common.me");
      return agents.find((a) => a.id === agentId)?.name ?? t("common.unknownAgent");
    };

    const getAgentAvatar = (agentId: string) => {
      return agents.find((a) => a.id === agentId)?.avatar ?? "";
    };

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
      if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey && isAgentResponding) {
        e.preventDefault();
        return;
      }
      baseHandleKeyDown(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      handleInputChange(e.target.value);
    };

    return (
      <div className={cn("bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 sticky bottom-0 z-10", className)}>
        <div className="px-3 py-2">
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
            <AutoResizeTextarea
              ref={inputRef}
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={t("chat.inputPlaceholder")}
              className="flex-1 resize-none text-sm outline-none border-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-none focus-visible:shadow-none shadow-none bg-transparent px-3 py-2 min-h-[20px] leading-tight text-gray-900 dark:text-gray-100"
              disabled={false}
              minRows={1}
              maxRows={4}
            />
            <Button
              type="button"
              onClick={(e) => handleSubmit(e as React.FormEvent)}
              disabled={!canSubmit || isLoading || isAgentResponding}
              size="icon"
              className={cn(
                "h-7 w-7 rounded-md mr-2 flex-shrink-0",
                canSubmit
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
              )}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <MentionSuggestions
          agents={filteredAgents}
          selectedIndex={selectedIndex}
          onSelect={selectMention}
          getAgentName={getAgentName}
          getAgentAvatar={getAgentAvatar}
          position={mentionPosition}
          // On mobile, show the suggestions above the caret to avoid being covered by the keyboard
          placement="top"
        />
      </div>
    );
  }
); 
