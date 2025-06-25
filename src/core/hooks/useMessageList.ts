import { reorganizeMessages } from "@/common/lib/discussion/message-utils";
import { AgentMessage, MessageWithResults } from "@/common/types/discussion";
import { useEffect, useRef, useState } from "react";
import { ScrollableLayoutRef } from "@/components/layouts/scrollable-layout";

export interface MessageListRef {
  scrollToBottom: (instant?: boolean) => void;
}

export interface MessageListHookProps {
  messages: AgentMessage[];
  discussionId?: string;
  scrollButtonThreshold?: number;
}

export interface MessageListHookResult {
  scrollableLayoutRef: React.RefObject<ScrollableLayoutRef>;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  showScrollButton: boolean;
  isTransitioning: boolean;
  reorganizedMessages: MessageWithResults[];
  handleScroll: (scrollTop: number, maxScroll: number) => void;
  scrollToBottom: (instant?: boolean) => void;
}

export function useMessageList({
  messages,
  discussionId,
  scrollButtonThreshold = 200,
}: MessageListHookProps): MessageListHookResult {
  const scrollableLayoutRef = useRef<ScrollableLayoutRef>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleScroll = (scrollTop: number, maxScroll: number) => {
    const distanceToBottom = maxScroll - scrollTop;
    setShowScrollButton(
      maxScroll > 0 && distanceToBottom > scrollButtonThreshold
    );
  };

  const scrollToBottom = (instant?: boolean) => {
    scrollableLayoutRef.current?.scrollToBottom(instant);
  };

  useEffect(() => {
    // 开始过渡
    setIsTransitioning(true);

    // 等待下一帧，让过渡效果生效
    requestAnimationFrame(() => {
      // 执行即时滚动
      scrollToBottom(true);

      // 300ms 后结束过渡
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    });
  }, [discussionId]);

  const reorganizedMessages = reorganizeMessages(messages);

  return {
    scrollableLayoutRef,
    messagesContainerRef,
    showScrollButton,
    isTransitioning,
    reorganizedMessages,
    handleScroll,
    scrollToBottom,
  };
} 