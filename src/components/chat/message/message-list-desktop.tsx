import { Button } from "@/components/ui/button";
import { ScrollableLayout } from "@/components/layouts/scrollable-layout";
import { cn } from "@/common/lib/utils";
import { AgentMessage } from "@/common/types/discussion";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { forwardRef, useImperativeHandle } from "react";
import { MessageCapture } from "./message-capture";
import { MessageItemWechat } from "./message-item-wechat";
import { useMessageList, type MessageListRef } from "@/hooks/useMessageList";

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
  discussionId?: string;
  messages: AgentMessage[];
  agentInfo: {
    getName: (agentId: string) => string;
    getAvatar: (agentId: string) => string;
  };
  className?: string;
  scrollButtonThreshold?: number;
}

export const MessageListDesktop = forwardRef<MessageListRef, MessageListDesktopProps>(
  function MessageListDesktop(
    {
      messages,
      agentInfo,
      className,
      scrollButtonThreshold = 200,
      discussionId,
    },
    ref
  ) {
    const {
      scrollableLayoutRef,
      messagesContainerRef,
      showScrollButton,
      isTransitioning,
      reorganizedMessages,
      handleScroll,
      scrollToBottom
    } = useMessageList({
      messages,
      discussionId,
      scrollButtonThreshold
    });

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      scrollToBottom: (instant?: boolean) => scrollToBottom(instant),
    }));

    return (
      <div className="relative h-full">
        <div className="absolute inset-0">
          <ScrollableLayout
            ref={scrollableLayoutRef}
            className={cn("h-full overflow-x-hidden bg-gray-100 dark:bg-gray-900", className)}
            initialAlignment="bottom"
            unpinThreshold={1}
            pinThreshold={30}
            onScroll={handleScroll}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={discussionId}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.2 },
                }}
                exit={{ opacity: 0 }}
                className={cn(
                  "py-4 transition-opacity duration-200",
                  isTransitioning && "opacity-0"
                )}
                ref={messagesContainerRef}
              >
                <div className="space-y-1 px-4">
                  {reorganizedMessages.map((message, index) => {
                    // 获取前一条消息的时间戳
                    const previousMessage = index > 0 ? reorganizedMessages[index - 1] : null;
                    const previousTimestamp = previousMessage 
                      ? new Date(previousMessage.timestamp).getTime() 
                      : undefined;
                      
                    return (
                      <MessageItemWechat
                        key={message.id}
                        message={message}
                        agentInfo={agentInfo}
                        previousMessageTimestamp={previousTimestamp}
                      />
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </ScrollableLayout>
        </div>

        {/* 浮动按钮组 */}
        <div className="absolute right-4 bottom-4 flex flex-col gap-2">
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