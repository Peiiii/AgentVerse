import { Button } from "@/common/components/ui/button";
import { ScrollableLayout } from "@/common/components/layouts/scrollable-layout";
import { cn } from "@/common/lib/utils";
import { AgentDef } from "@/common/types/agent";
// 去掉容器级动画，避免切换会话时的闪烁
import { ArrowDown } from "lucide-react";
import { forwardRef, useImperativeHandle, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCapture } from "./message-capture";
import { MessageItemWechat } from "./message-item-wechat";
import { useMessageList, type MessageListRef } from "@/core/hooks/useMessageList";
import { useChatScrollStore } from "@/common/features/chat/stores/chat-scroll.store";
import { useAgents } from "@/core/hooks/useAgents";
import { usePresenter } from "@/core/presenter";
import { useMessages } from "@/core/hooks/useMessages";
import { useCurrentDiscussionId } from "@/core/hooks/useCurrentDiscussionId";
import { chatScrollManager } from "@/common/features/chat/managers/chat-scroll.manager";

/**
 * 微信PC端消息列表设计：
 * - 浅灰色背景
 * - 消息气泡靠左/靠右对齐
 * - 自己的消息在右侧，绿色背景
 * - 对方的消息在左侧，白色背景
 * - 消息之间有适当间距
 * - 滚动到底部按钮只在需要时显示
 */

interface MessageListDesktopProps {
  className?: string;
  scrollButtonThreshold?: number;
}

export const MessageListDesktop = forwardRef<MessageListRef, MessageListDesktopProps>(
  function MessageListDesktop(
    {
      className,
      scrollButtonThreshold = 200,
    },
    ref
  ) {
    const { agents } = useAgents();
    const presenter = usePresenter();
    const navigate = useNavigate();
    const currentDiscussionId = useCurrentDiscussionId() ?? undefined;
    const { messages } = useMessages();
    const { pinned, initialSynced } = useChatScrollStore();
    const {
      scrollableLayoutRef,
      messagesContainerRef,
      showScrollButton,
      reorganizedMessages,
      handleScroll,
      scrollToBottom,
      contentVersion,
    } = useMessageList({
      messages,
      discussionId: currentDiscussionId,
      scrollButtonThreshold
    });

    const agentMap = useMemo(() => {
      return new Map(agents.map(agent => [agent.id, agent]));
    }, [agents]);

    // 获取当前正在响应的 agentId（基于最后一条 streaming 状态消息）
    const respondingAgentId = useMemo(() => {
      const last = reorganizedMessages[reorganizedMessages.length - 1];
      return last && last.status === 'streaming' ? last.agentId : null;
    }, [reorganizedMessages]);

    const handleEditAgentWithAI = useCallback((agent: AgentDef) => {
      navigate(`/agents/${agent.id}?tab=ai-create`);
    }, [navigate]);

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      scrollToBottom: (instant?: boolean) => scrollToBottom(instant),
    }));

    return (
      <div className="relative h-full">
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-900" data-capture-root>
          <ScrollableLayout
            ref={scrollableLayoutRef}
            className={cn("h-full overflow-x-hidden", className)}
            initialAlignment="bottom"
            unpinThreshold={30}
            pinThreshold={30}
            onScroll={handleScroll}
            conversationId={currentDiscussionId ?? null}
            contentVersion={contentVersion}
            pinned={pinned}
            initialSynced={initialSynced}
            onPinnedChange={chatScrollManager.setPinned}
            onInitialSynced={chatScrollManager.markInitialSynced}
          >
            <div className={cn("py-4")}
              ref={messagesContainerRef}>
              <div className="space-y-1 px-4">
                {reorganizedMessages.map((message, index) => {
                  // 获取前一条消息的时间戳
                  const previousMessage = index > 0 ? reorganizedMessages[index - 1] : null;
                  const previousTimestamp = previousMessage
                    ? new Date(previousMessage.timestamp).getTime()
                    : undefined;

                  // 获取对应的 agent 信息
                  const agent = agentMap.get(message.agentId);

                  // 只有正在生成的最新消息才显示响应动画
                  // 检查：1. agentId 匹配正在响应的 agent 2. 是最后一条消息
                  const isLastMessage = index === reorganizedMessages.length - 1;
                  const isResponding = message.agentId === respondingAgentId && isLastMessage;

                  return (
                    <MessageItemWechat
                      key={message.id}
                      message={message}
                      agentInfo={{ getName: presenter.agents.getAgentName, getAvatar: presenter.agents.getAgentAvatar }}
                      agent={agent}
                      previousMessageTimestamp={previousTimestamp}
                      onEditAgentWithAI={handleEditAgentWithAI}
                      isResponding={isResponding}
                    />
                  );
                })}
              </div>
            </div>
          </ScrollableLayout>
        </div>

        {/* 浮动按钮组 */}
        <div className="absolute right-4 bottom-4 flex flex-col gap-2" data-ignore-capture>
          <MessageCapture
            containerRef={messagesContainerRef}
            className="rounded-full shadow-md bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          />

          {showScrollButton && (
            <Button
              variant="outline"
              size="icon"
              className="rounded-full shadow-md bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => scrollToBottom()}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }
); 
