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
import { useTranslation } from "@/core/hooks/use-i18n";

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
    const isAgentResponding = presenter.discussionControl.getSnapshot().currentSpeakerId !== null;

    const {
      input,
      setInput,
      inputRef,
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

    const mentionAgents = useMemo(() => 
      agents.filter((agent) => 
        members.some((member) => member.agentId === agent.id)
      ),
      [agents, members]
    );

    const { t } = useTranslation();
    const getAgentName = useMemo(() => (agentId: string) => {
      if (agentId === "user") return t("common.me");
      return agents.find((a) => a.id === agentId)?.name ?? t("common.unknownAgent");
    }, [agents, t]);

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
      <div className={cn("relative bg-white dark:bg-gray-800 rounded-md", className)}>
        <div className="p-3">
          <AutoResizeTextarea
            ref={inputRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={t("chat.inputPlaceholderDesktop")}
            className="w-full resize-none text-sm outline-none border-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-none focus-visible:shadow-none shadow-none bg-transparent text-gray-900 dark:text-gray-100"
            disabled={false}
            minRows={2}
            maxRows={6}
          />
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-right">
            {t("chat.sendHint")}
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
