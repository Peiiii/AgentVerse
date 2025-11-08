import { reorganizeMessages } from "@/common/lib/discussion/message-utils";
import { AgentMessage, MessageWithResults } from "@/common/types/discussion";
import { useEffect, useRef, useState } from "react";
import { ScrollableLayoutRef } from "@/common/components/layouts/scrollable-layout";
import { chatScrollManager } from "@/common/features/chat/managers/chat-scroll.manager";

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
  contentVersion: string;
}

export function useMessageList({
  messages,
  discussionId,
  scrollButtonThreshold = 200,
}: MessageListHookProps): MessageListHookResult {
  const scrollableLayoutRef = useRef<ScrollableLayoutRef>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  // 不再做容器级的淡入/淡出过渡，避免切会话时闪烁
  const [isTransitioning] = useState(false);

  const handleScroll = (scrollTop: number, maxScroll: number) => {
    const distanceToBottom = maxScroll - scrollTop;
    setShowScrollButton(
      maxScroll > 0 && distanceToBottom > scrollButtonThreshold
    );
  };

  const scrollToBottom = (instant?: boolean) => {
    scrollableLayoutRef.current?.scrollToBottom(instant);
  };

  const reorganizedMessages = reorganizeMessages(messages);
  const contentVersion =
    reorganizedMessages.length > 0
      ? `${discussionId ?? "none"}:${reorganizedMessages[reorganizedMessages.length - 1]?.id}`
      : `empty-${discussionId ?? "none"}`;
  useEffect(() => {
    chatScrollManager.setConversation(discussionId ?? null);
  }, [discussionId]);

  return {
    scrollableLayoutRef,
    messagesContainerRef,
    showScrollButton,
    isTransitioning,
    reorganizedMessages,
    handleScroll,
    scrollToBottom,
    contentVersion,
  };
}
