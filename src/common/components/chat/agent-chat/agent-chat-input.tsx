import { ModernChatInput } from "@/common/components/chat/modern-chat-input";
import { AgentDef } from "@/common/types/agent";

interface AgentChatInputProps {
  agent: AgentDef;
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onAbort?: () => void;
  disabled?: boolean;
  sendDisabled?: boolean;
}

export function AgentChatInput({ 
  agent, 
  value, 
  onChange, 
  onSend, 
  onAbort,
  disabled = false,
  sendDisabled
}: AgentChatInputProps) {
  return (
    <div className="p-6 border-t">
      <div className="max-w-4xl mx-auto">
        <ModernChatInput
          value={value}
          onChange={onChange}
          onSend={onSend}
          onAbort={onAbort}
          disabled={disabled}
          sendDisabled={sendDisabled}
          placeholder={`与 ${agent.name} 对话...`}
        />
      </div>
    </div>
  );
} 