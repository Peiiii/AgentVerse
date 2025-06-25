import { AgentMessage } from "@/common/types/discussion";
import { forwardRef } from "react";
import { MessageListDesktop } from "./message-list-desktop";
import { MessageListMobile } from "./message-list-mobile";
import { useBreakpointContext } from "@/components/common/breakpoint-provider";
import { MessageListRef } from "@/hooks/useMessageList";

interface MessageListProps {
  discussionId?: string;
  messages: AgentMessage[];
  agentInfo: {
    getName: (agentId: string) => string;
    getAvatar: (agentId: string) => string;
  };
  className?: string;
  scrollButtonThreshold?: number; // 显示滚动按钮的阈值
}

export const MessageList = forwardRef<MessageListRef, MessageListProps>(
  function MessageList(props, ref) {
    const { isMobile } = useBreakpointContext();

    if (isMobile) {
      return <MessageListMobile {...props} ref={ref} />;
    }

    return <MessageListDesktop {...props} ref={ref} />;
  }
);

// 重新导出类型，方便其他组件使用
export type { MessageListRef };
