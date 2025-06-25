import { useMemoizedFn } from "ahooks";
import { RefObject, useEffect, useRef } from "react";

interface ScrollState {
  isPinned: boolean; // 是否处于贴底模式
  lastScrollTop: number; // 上一次的滚动位置，用于判断滚动方向
  lastScrollHeight: number; // 上一次的内容高度，用于判断内容是否变化
}

interface UseAutoScrollOptions {
  pinThreshold?: number; // 进入贴底模式的阈值
  unpinThreshold?: number; // 退出贴底模式的阈值（向上滚动的最小距离）
}

export function useAutoScroll(
  containerRef: RefObject<HTMLDivElement>,
  content: unknown,
  options: UseAutoScrollOptions = {}
) {
  const {
    pinThreshold = 30, // 默认 30px
    unpinThreshold = 10, // 默认 10px
  } = options;

  // 使用 ref 存储滚动状态，避免重渲染
  const stateRef = useRef<ScrollState>({
    isPinned: true, // 默认贴底
    lastScrollTop: 0,
    lastScrollHeight: 0,
  });

  // 检查是否接近底部
  const isNearBottom = () => {
    const container = containerRef.current;
    if (!container) return false;

    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight <= pinThreshold;
  };

  // 滚动到底部
  const scrollToBottom = useMemoizedFn((instant?: boolean) => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: instant ? "instant" : "smooth",
    });
  });

  // 处理滚动事件
  const handleScroll = useMemoizedFn(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight } = container;
    const state = stateRef.current;

    // 判断滚动方向
    const scrollingUp = scrollTop < state.lastScrollTop;
    const scrollingDown = scrollTop > state.lastScrollTop;

    // 更新贴底状态
    if (scrollingDown && isNearBottom()) {
      state.isPinned = true;
    } else if (
      scrollingUp &&
      Math.abs(scrollTop - state.lastScrollTop) > unpinThreshold
    ) {
      state.isPinned = false;
    }

    // 更新状态
    state.lastScrollTop = scrollTop;
    state.lastScrollHeight = scrollHeight;
  });

  // 监听滚动事件
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [containerRef, handleScroll]);

  // 监听内容变化
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const state = stateRef.current;
    const contentChanged = container.scrollHeight !== state.lastScrollHeight;

    // 只在贴底模式下自动滚动
    if (state.isPinned && contentChanged) {
      scrollToBottom();
    }

    state.lastScrollHeight = container.scrollHeight;
  }, [containerRef, content, scrollToBottom]);

  return {
    isPinned: stateRef.current.isPinned,
    scrollToBottom,
  };
}
