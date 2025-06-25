import { useAutoScroll } from "@/hooks/useAutoScroll";
import { cn } from "@/common/lib/utils";
import {
  forwardRef,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

interface ScrollableLayoutProps {
  children: ReactNode;
  className?: string;
  initialAlignment?: "top" | "bottom";
  onScroll?: (scrollTop: number, maxScroll: number) => void;
  pinThreshold?: number;
  unpinThreshold?: number;
}

export interface ScrollableLayoutRef {
  scrollToBottom: (instant?: boolean) => void;
}

export const ScrollableLayout = forwardRef<
  ScrollableLayoutRef,
  ScrollableLayoutProps
>(function ScrollableLayout(
  {
    children,
    className,
    initialAlignment = "top",
    onScroll,
    pinThreshold,
    unpinThreshold,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollToBottom } = useAutoScroll(containerRef, children, {
    pinThreshold,
    unpinThreshold,
  });

  useImperativeHandle(ref, () => ({
    scrollToBottom,
  }));

  // 初始化滚动位置 - 使用 instant 模式
  useEffect(() => {
    if (initialAlignment === "bottom") {
      scrollToBottom(true); // 传入 true 使用 instant 模式
    }
  }, [initialAlignment, scrollToBottom]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const maxScroll = scrollHeight - clientHeight;

    onScroll?.(scrollTop, maxScroll);
  };

  return (
    <div
      ref={containerRef}
      className={cn("overflow-y-auto relative", className)}
      onScroll={handleScroll}
    >
      {children}
    </div>
  );
});
