import { forwardRef } from "react";
import { useBreakpointContext } from "@/common/components/common/breakpoint-provider";
import { MessageInputDesktop } from "./message-input-desktop";
import { MessageInputMobile } from "./message-input-mobile";

export interface MessageInputRef {
  setValue: (value: string) => void;
  focus: () => void;
}

interface MessageInputProps {
  onSendMessage: (content: string, agentId: string) => Promise<void>;
  className?: string;
  isFirstMessage?: boolean;
}

export const MessageInput = forwardRef<MessageInputRef, MessageInputProps>(
  function MessageInput(props, ref) {
    const { isMobile } = useBreakpointContext();

    if (isMobile) {
      return <MessageInputMobile  {...props} ref={ref} />;
    }

    return <MessageInputDesktop {...props} ref={ref} />;
  }
);
