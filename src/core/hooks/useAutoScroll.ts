import { useMemoizedFn } from "ahooks";
import { RefObject, useEffect, useRef } from "react";

interface ScrollState {
  lastScrollTop: number;
  lastScrollHeight: number;
}

interface UseAutoScrollOptions {
  pinThreshold?: number;
  unpinThreshold?: number;
  conversationId?: string | null;
  contentVersion?: string | number;
  pinned?: boolean;
  initialSynced?: boolean;
  onPinnedChange?: (pinned: boolean) => void;
  onInitialSynced?: () => void;
}

export function useAutoScroll(
  containerRef: RefObject<HTMLDivElement>,
  _content: unknown,
  options: UseAutoScrollOptions = {}
) {
  const {
    pinThreshold = 30,
    unpinThreshold = 10,
    conversationId = null,
    contentVersion,
    pinned = true,
    initialSynced = false,
    onPinnedChange,
    onInitialSynced,
  } = options;

  const stateRef = useRef<ScrollState>({
    lastScrollTop: 0,
    lastScrollHeight: 0,
  });
  const pinnedRef = useRef(pinned);
  const hasInitializedRef = useRef(false);
  const skipNextSmoothRef = useRef(true);
  const previousConversationRef = useRef<string | null>(conversationId ?? null);

  const scrollToBottom = useMemoizedFn((instant?: boolean) => {
    const container = containerRef.current;
    if (!container) return;

    if (instant) {
      container.scrollTop = container.scrollHeight;
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  });

  const isNearBottom = () => {
    const container = containerRef.current;
    if (!container) return false;

    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight <= pinThreshold;
  };

  const handleScroll = useMemoizedFn(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop } = container;
    const scrollingUp = scrollTop < stateRef.current.lastScrollTop;
    const scrollingDown = scrollTop > stateRef.current.lastScrollTop;

    if (scrollingDown && isNearBottom()) {
      pinnedRef.current = true;
      onPinnedChange?.(true);
    } else if (
      scrollingUp &&
      Math.abs(scrollTop - stateRef.current.lastScrollTop) > unpinThreshold
    ) {
      pinnedRef.current = false;
      onPinnedChange?.(false);
    }

    stateRef.current.lastScrollTop = scrollTop;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [containerRef, handleScroll]);

  useEffect(() => {
    if (conversationId === previousConversationRef.current) return;
    previousConversationRef.current = conversationId ?? null;
    hasInitializedRef.current = false;
    skipNextSmoothRef.current = true;
    stateRef.current = {
      lastScrollTop: 0,
      lastScrollHeight: 0,
    };
    // On conversation switch, snap to bottom instantly to show the latest context
    // This ensures default sticky experience when entering a chat
    scrollToBottom(true);
  }, [conversationId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const contentChanged =
      container.scrollHeight !== stateRef.current.lastScrollHeight;

    if (contentChanged) {
      const shouldUseInstant =
        !hasInitializedRef.current || skipNextSmoothRef.current;

      if (!initialSynced || shouldUseInstant) {
        scrollToBottom(true);
        onInitialSynced?.();
      } else if (pinned) {
        scrollToBottom(false);
      }

      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true;
      }

      if (skipNextSmoothRef.current) {
        skipNextSmoothRef.current = false;
      }
    }

    stateRef.current.lastScrollHeight = container.scrollHeight;
  }, [containerRef, contentVersion, pinned, initialSynced, scrollToBottom]);

  return {
    isPinned: pinned,
    scrollToBottom,
  };
}
