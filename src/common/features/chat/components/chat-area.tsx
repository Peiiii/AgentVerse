import { InitialExperience } from "@/common/features/home/components/initial-experience";
import { AGENT_COMBINATIONS, AgentCombinationType } from "@/core/config/agents";
import { DEFAULT_SCENARIOS } from "@/core/config/guide-scenarios";
import { useDiscussionMembers } from "@/core/hooks/useDiscussionMembers";
import { useDiscussions } from "@/core/hooks/useDiscussions";
import { useViewportHeight } from "@/core/hooks/useViewportHeight";
import { cn } from "@/common/lib/utils";
import { useEffect, useRef, useState } from "react";
import { ChatEmptyGuide } from "./chat-empty-guide";
import { MessageList, MessageListRef } from "./message";
import { MessageInput, MessageInputRef } from "./message-input";
import { usePresenter } from "@/core/presenter";
import { useAgents } from "@/core/hooks/useAgents";
import { useMessages } from "@/core/hooks/useMessages";
import { discussionMembersResource } from "@/core/resources";
import { useTranslation } from "@/core/hooks/use-i18n";

interface ChatAreaProps {
  className?: string;
  messageListClassName?: string;
  inputAreaClassName?: string;
  discussionStatus?: "active" | "paused" | "completed";
  onStartDiscussion?: () => void;
  onInitialStateChange?: (isInitialState: boolean) => void;
}

export function ChatArea({
  className,
  messageListClassName,
  inputAreaClassName,
  onInitialStateChange,
}: ChatAreaProps) {
  const { t } = useTranslation();
  const presenter = usePresenter();
  const { messages } = useMessages();
  const { isKeyboardVisible } = useViewportHeight();
  const messageListRef = useRef<MessageListRef>(null);
  const messageInputRef = useRef<MessageInputRef>(null);
  const isFirstMessage = messages.length === 0;
  const { currentDiscussion } = useDiscussions();
  const { members } = useDiscussionMembers();
  const { agents } = useAgents();
  // 避免在"开始讨论"后短暂出现空会话引导造成的闪烁
  const [isStartingDiscussion, setIsStartingDiscussion] = useState(false);

  const syncDiscussionMembers = () => {
    const latest = discussionMembersResource.current.getState().data ?? [];
    presenter.discussionControl.setMembers(latest);
  };

  // messages are reactive via resources; no need to sync into discussion control service

  // 同步成员到讨论控制服务，以便 run() 能生效（需要 members + messages 条件）
  useEffect(() => {
    presenter.discussionControl.setMembers(members);
  }, [members]);

  useEffect(() => {
    const isInitialState = members.length === 0 && messages.length === 0;
    onInitialStateChange?.(isInitialState);
  }, [members.length, messages.length, onInitialStateChange]);

  const handleSendMessage = async (content: string, agentId: string) => {
    console.log(
      `发送消息: ${content.slice(0, 30)}${
        content.length > 30 ? "..." : ""
      } (来自: ${agentId})`
    );

    console.log("[chat-area] handleSendMessage before add message", messages);
    try {
      // 发送消息
      if (!currentDiscussion) return;
      const agentMessage = await presenter.messages.add(currentDiscussion.id, {
        content,
        agentId,
        type: "text",
        timestamp: new Date(),
      });
      if (agentMessage) {
        console.log("[chat-area] handleSendMessage after add message", members);
        syncDiscussionMembers();
        // no need to mirror messages into service; run loop consumes from store/services
        // 直接走简化控制器：先启动/恢复，再处理本条消息（无事件总线）
        await presenter.discussionControl.startIfEligible();
        await presenter.discussionControl.process(agentMessage);
      }
      console.log("消息发送成功");
    } catch (error) {
      console.error("发送消息失败:", error);
      } finally {
      // 确保消息列表滚动到底部（用户发送后立即定位，使用 instant）
      messageListRef.current?.scrollToBottom(true);
    }
  };

  const handleStartDiscussion = async (topic: string, customMembers?: { agentId: string; isAutoReply: boolean }[]) => {
    console.log("开始讨论:", topic);

    try {
      // 标记开始流程，避免空引导闪烁
      setIsStartingDiscussion(true);
      if (!currentDiscussion) {
        console.error("当前没有可用的讨论");
        setIsStartingDiscussion(false);
        return;
      }

      console.log("使用当前讨论:", currentDiscussion.id);

      // 如果提供了自定义成员，直接使用它们
      if (customMembers && customMembers.length > 0) {
        console.log(`使用自定义成员: ${customMembers.length} 个成员`);
        await presenter.discussionMembers.addMany(customMembers);
        syncDiscussionMembers();
        await handleSendMessage(topic, "user");
        return;
      }

      // 使用预设组合
      const combinationKey = window.localStorage.getItem('selectedCombinationKey') || "thinkingTeam";
      const selectedCombination = AGENT_COMBINATIONS[combinationKey as AgentCombinationType];
      console.log("选择的组合:", combinationKey, selectedCombination.name);

      const membersToAdd = [];

      // Always use latest agents list from hook
      const agentList = agents;

      // 添加主持人（设置为自动回复）
      const moderatorSlug = selectedCombination.moderator as unknown as string;
      const findAgentIdBySlug = (slug: string) => {
        const a = agentList.find((x) => x.slug === slug);
        return a ? a.id : null;
      };
      const moderatorId = findAgentIdBySlug(moderatorSlug);

      if (moderatorId) {
        console.log(`准备添加主持人: ${moderatorId} (${moderatorSlug})`);
        membersToAdd.push({ agentId: moderatorId, isAutoReply: true });
      } else {
        console.error(`未找到匹配的主持人: ${moderatorSlug}`);
      }

      // 添加参与者（不设置自动回复）
      for (const slug of selectedCombination.participants as unknown as string[]) {
        const participantId = findAgentIdBySlug(slug);

        if (participantId) {
          console.log(`准备添加参与者: ${participantId} (${slug})`);
          membersToAdd.push({ agentId: participantId, isAutoReply: false });
        } else {
          console.error(`未找到匹配的参与者: ${slug}`);
        }
      }

      console.log("准备添加的成员:", membersToAdd);

      // 批量添加所有成员
      if (membersToAdd.length > 0) {
        console.log(`批量添加 ${membersToAdd.length} 个成员...`);
        await presenter.discussionMembers.addMany(membersToAdd);
        syncDiscussionMembers();
        await handleSendMessage(topic, "user");
      } else {
        console.error("没有成功添加任何成员，无法启动讨论");
      }
    } catch (error) {
      console.error("启动讨论失败:", error);
      setIsStartingDiscussion(false);
    }
  };

  // 当有消息产生后，关闭“开始中”状态
  useEffect(() => {
    if (isStartingDiscussion && messages.length > 0) {
      setIsStartingDiscussion(false);
    }
  }, [isStartingDiscussion, messages.length]);

  if (!currentDiscussion) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        {t("chat.selectOrCreate")}
      </div>
    );
  }

  // 如果没有成员且没有消息，显示初始体验页面
  if (members.length === 0 && messages.length === 0) {
    return (
      <InitialExperience
        onStart={handleStartDiscussion}
        onChangeTeam={(key) => {
          console.log("切换团队:", key);
          // 确保localStorage中的值是正确的
          window.localStorage.setItem('selectedCombinationKey', key);
        }}
        className="h-full"
      />
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* 消息列表区域 */}
      <div
        className={cn(
          "flex-1 min-h-0 overflow-y-auto relative scrollbar-thin",
          messageListClassName
        )}
      >
        {messages.length === 0 ? (
          <div className="py-4 pr-4">
            {isStartingDiscussion ? (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                {t("chat.creatingDiscussion")}
              </div>
            ) : (
              <ChatEmptyGuide
                scenarios={DEFAULT_SCENARIOS}
                membersCount={members.length}
                onSuggestionClick={(template) => {
                  messageInputRef.current?.setValue(template);
                  messageInputRef.current?.focus();
                }}
              />
            )}
          </div>
        ) : (
          <MessageList
            ref={messageListRef}
            data-testid="chat-message-list"
            className="py-4 px-4"
          />
        )}
      </div>

      {/* 输入框区域 */}
      <div
        className={cn(
          "flex-none border-t dark:border-gray-700",
          "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
          isKeyboardVisible && "shadow-lg",
          inputAreaClassName
        )}
      >
        <MessageInput
          ref={messageInputRef}
          isFirstMessage={isFirstMessage}
          data-testid="chat-message-input"
        />
      </div>
    </div>
  );
}
