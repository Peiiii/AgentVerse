import { Button } from "@/common/components/ui/button";
import { ScrollableLayout } from "@/common/components/layouts/scrollable-layout";
import { cn } from "@/common/lib/utils";
import { AgentMessage } from "@/common/types/discussion";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { forwardRef, useImperativeHandle, useState, useCallback, useEffect, useRef } from "react";
import { MessageCapture } from "./message-capture";
import { MessageItem } from "./message-item";
import { useMessageList, type MessageListRef } from "@/core/hooks/useMessageList";

/**
 * 移动端消息列表设计：
 * - 适应移动设备的紧凑布局
 * - 消息气泡靠左/靠右对齐
 * - 自己的消息在右侧
 * - 对方的消息在左侧
 * - 优化触摸交互
 */

interface MessageListMobileProps {
  discussionId?: string;
  messages: AgentMessage[];
  agentInfo: {
    getName: (agentId: string) => string;
    getAvatar: (agentId: string) => string;
  };
  className?: string;
  scrollButtonThreshold?: number;
}

export const MessageListMobile = forwardRef<MessageListRef, MessageListMobileProps>(
  function MessageListMobile(
    {
      messages,
      agentInfo,
      className,
      scrollButtonThreshold = 200,
      discussionId,
    },
    ref
  ) {
    // 使用本地状态管理滚动按钮的显示
    const [showScrollButton, setShowScrollButton] = useState(false);
    // 保存容器DOM引用
    const containerRef = useRef<HTMLDivElement>(null);
    
    const {
      scrollableLayoutRef,
      messagesContainerRef,
      reorganizedMessages,
      scrollToBottom
    } = useMessageList({
      messages,
      discussionId,
      scrollButtonThreshold,
    });

    // 自定义滚动处理函数
    const handleScroll = useCallback((scrollTop: number, maxScroll: number) => {
      const distanceToBottom = maxScroll - scrollTop;
      setShowScrollButton(maxScroll > 0 && distanceToBottom > scrollButtonThreshold);
    }, [scrollButtonThreshold]);

    // 当有新消息时，检查是否需要显示滚动按钮
    useEffect(() => {
      // 使用containerRef访问DOM元素
      if (containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const maxScroll = scrollHeight - clientHeight;
        const distanceToBottom = maxScroll - scrollTop;
        
        // 如果距离底部超过阈值，显示滚动按钮
        if (maxScroll > 0 && distanceToBottom > scrollButtonThreshold) {
          setShowScrollButton(true);
        }
      }
    }, [messages.length, scrollButtonThreshold]);

    // 将ref暴露给父组件
    useImperativeHandle(ref, () => ({
      scrollToBottom,
    }));

    return (
      <div ref={containerRef} className="h-full">
        <ScrollableLayout
          ref={scrollableLayoutRef}
          onScroll={handleScroll}
          className={cn("relative bg-gray-50 dark:bg-gray-900 h-full", className)}
          initialAlignment="bottom"
          unpinThreshold={1}
          pinThreshold={30}
        >
          {/* 消息列表 */}
          <div
            ref={messagesContainerRef}
            className="flex flex-col min-h-full pb-4 pt-2"
          >
            <AnimatePresence initial={false}>
              {reorganizedMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MessageItem
                    message={message}
                    agentInfo={agentInfo}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* 浮动按钮组 */}
          <div className="fixed right-3 bottom-24 flex flex-col gap-2 z-10">
            {/* 消息捕获按钮 */}
            <MessageCapture
              containerRef={messagesContainerRef}
              className="rounded-full shadow-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
            />

            {/* 滚动到底部按钮 - 智能显示 */}
            {showScrollButton && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 25,
                  duration: 0.3
                }}
              >
                <Button
                  size="icon"
                  className="h-8 w-8 rounded-full shadow-md bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => scrollToBottom()}
                >
                  <ArrowDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </Button>
              </motion.div>
            )}
          </div>
        </ScrollableLayout>
      </div>
    );
  }
); 