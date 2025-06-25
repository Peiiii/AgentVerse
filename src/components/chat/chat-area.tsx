import { InitialExperience } from "@/components/home/initial-experience";
import { AGENT_COMBINATIONS, AgentCombinationType } from "@/config/agents";
import { DEFAULT_SCENARIOS } from "@/config/guide-scenarios";
import { useDiscussionMembers } from "@/hooks/useDiscussionMembers";
import { useDiscussions } from "@/hooks/useDiscussions";
import { useViewportHeight } from "@/hooks/useViewportHeight";
import { cn } from "@/common/lib/utils";
import { discussionControlService } from "@/services/discussion-control.service";
import { AgentMessage } from "@/common/types/discussion";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { ChatEmptyGuide } from "./chat-empty-guide";
import { MessageList, MessageListRef } from "./message";
import { MessageInput, MessageInputRef } from "./message-input";
import { useAgents } from "@/hooks/useAgents";

interface ChatAreaProps {
  messages: AgentMessage[];
  onSendMessage: (content: string, agentId: string) => Promise<void>;
  getAgentName: (agentId: string) => string;
  getAgentAvatar: (agentId: string) => string;
  className?: string;
  messageListClassName?: string;
  inputAreaClassName?: string;
  discussionStatus?: "active" | "paused" | "completed";
  onStartDiscussion?: () => void;
  onInitialStateChange?: (isInitialState: boolean) => void;
}

export function ChatArea({
  messages,
  onSendMessage,
  getAgentName,
  getAgentAvatar,
  className,
  messageListClassName,
  inputAreaClassName,
  onInitialStateChange,
}: ChatAreaProps) {
  const { isKeyboardVisible } = useViewportHeight();
  const messageListRef = useRef<MessageListRef>(null);
  const messageInputRef = useRef<MessageInputRef>(null);
  const isFirstMessage = messages.length === 0;
  const { currentDiscussion } = useDiscussions();
  const { members, addMembers } = useDiscussionMembers();
  const { agents } = useAgents();

  useEffect(() => {
    discussionControlService.setMembers(members);
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

    try {
      // 发送消息
      await onSendMessage(content, agentId);
      console.log("消息发送成功");

      // 如果有成员，则尝试运行讨论控制服务
      if (members.length > 0) {
        console.log(`检测到 ${members.length} 个成员，启动讨论控制服务...`);
        try {
          await discussionControlService.run();
          console.log("讨论控制服务运行成功");
        } catch (error) {
          console.error("讨论控制服务运行失败:", error);
        }
      } else {
        console.log("没有成员，跳过讨论控制服务");
      }
    } catch (error) {
      console.error("发送消息失败:", error);
    } finally {
      // 确保消息列表滚动到底部
      messageListRef.current?.scrollToBottom();
    }
  };

  const handleStartDiscussion = async (topic: string, customMembers?: { agentId: string; isAutoReply: boolean }[]) => {
    console.log("开始讨论:", topic);

    try {
      if (!currentDiscussion) {
        console.error("当前没有可用的讨论");
        return;
      }

      console.log("使用当前讨论:", currentDiscussion.id);

      // 如果提供了自定义成员，直接使用它们
      if (customMembers && customMembers.length > 0) {
        console.log(`使用自定义成员: ${customMembers.length} 个成员`);
        await addMembers(customMembers);
        await onSendMessage(topic, "user");
        try {
          await discussionControlService.run();
        } catch (error) {
          console.error("运行讨论控制服务失败:", error);
        }
        return;
      }

      // 使用预设组合
      const combinationKey = window.localStorage.getItem('selectedCombinationKey') || "thinkingTeam";
      const selectedCombination = AGENT_COMBINATIONS[combinationKey as AgentCombinationType];
      console.log("选择的组合:", combinationKey, selectedCombination.name);

      const membersToAdd = [];

      // 查找代理ID
      const findAgentIdByName = (name: string) => {
        for (const agent of agents) {
          if (agent.name === name) {
            return agent.id;
          }
        }
        return null;
      };

      // 添加主持人（设置为自动回复）
      const moderatorName = selectedCombination.moderator.name;
      const moderatorId = findAgentIdByName(moderatorName);

      if (moderatorId) {
        console.log(`准备添加主持人: ${moderatorId} (${moderatorName})`);
        membersToAdd.push({ agentId: moderatorId, isAutoReply: true });
      } else {
        console.error(`未找到匹配的主持人: ${moderatorName}`);
      }

      // 添加参与者（不设置自动回复）
      for (const participant of selectedCombination.participants) {
        const participantName = participant.name;
        const participantId = findAgentIdByName(participantName);

        if (participantId) {
          console.log(`准备添加参与者: ${participantId} (${participantName})`);
          membersToAdd.push({ agentId: participantId, isAutoReply: false });
        } else {
          console.error(`未找到匹配的参与者: ${participantName}`);
        }
      }

      console.log("准备添加的成员:", membersToAdd);

      // 批量添加所有成员
      if (membersToAdd.length > 0) {
        console.log(`批量添加 ${membersToAdd.length} 个成员...`);
        await addMembers(membersToAdd);
        await onSendMessage(topic, "user");
        try {
          await discussionControlService.run();
        } catch (error) {
          console.error("运行讨论控制服务失败:", error);
        }
      } else {
        console.error("没有成功添加任何成员，无法启动讨论");
      }
    } catch (error) {
      console.error("启动讨论失败:", error);
    }
  };

  const agentInfoGetter = {
    getName: getAgentName,
    getAvatar: getAgentAvatar,
  };

  if (!currentDiscussion) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        请选择或创建一个会话
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
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            <motion.div
              key="empty-guide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4 pr-4"
            >
              <ChatEmptyGuide
                scenarios={DEFAULT_SCENARIOS}
                membersCount={members.length}
                onSuggestionClick={(template) => {
                  messageInputRef.current?.setValue(template);
                  messageInputRef.current?.focus();
                }}
              />
            </motion.div>
          ) : (
            <MessageList
              discussionId={currentDiscussion.id}
              ref={messageListRef}
              messages={messages}
              agentInfo={agentInfoGetter}
              data-testid="chat-message-list"
              className="py-4 px-4"
            />
          )}
        </AnimatePresence>
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
          onSendMessage={handleSendMessage}
          data-testid="chat-message-input"
        />
      </div>
    </div>
  );
}
