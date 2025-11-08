import { ModernChatInput } from "@/common/features/chat/components/modern-chat-input";
import { AgentDef } from "@/common/types/agent";
import { cn } from "@/common/lib/utils";

interface AgentChatInputProps {
  agent: AgentDef;
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onAbort?: () => void;
  disabled?: boolean;
  sendDisabled?: boolean;
  customPlaceholder?: string;
  containerWidth?: "narrow" | "wide" | "auto";
  className?: string;
}

export function AgentChatInput({ 
  agent, 
  value, 
  onChange, 
  onSend, 
  onAbort,
  disabled = false,
  sendDisabled,
  customPlaceholder,
  containerWidth = "wide",
  className,
}: AgentChatInputProps) {
  const containerWidthClasses = {
    narrow: "max-w-2xl",
    wide: "max-w-4xl", 
    auto: "max-w-none",
  };

  const placeholder = customPlaceholder || `与 ${agent.name} 对话...`;

  return (
    <div className={cn("p-6 border-t", className)}>
      <div className={cn("mx-auto", containerWidthClasses[containerWidth])}>
        <ModernChatInput
          value={value}
          onChange={onChange}
          onSend={onSend}
          onAbort={onAbort}
          disabled={disabled}
          sendDisabled={sendDisabled}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
} 