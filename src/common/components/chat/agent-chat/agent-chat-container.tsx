import { AgentChatHeader } from "./agent-chat-header";
import { AgentChatMessages } from "./agent-chat-messages";
import { AgentChatInput } from "./agent-chat-input";
import { Agent } from "@/common/types/agent";
import { ChatMessage } from "@/common/types/chat";

interface AgentChatContainerProps {
  agent: Agent;
  messages: ChatMessage[];
  inputMessage: string;
  isThinking: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
}

export function AgentChatContainer({
  agent,
  messages,
  inputMessage,
  isThinking,
  onInputChange,
  onSendMessage,
}: AgentChatContainerProps) {
  return (
    <div className="w-1/2 min-w-0 flex flex-col">
      <AgentChatHeader agent={agent} />
      <AgentChatMessages 
        agent={agent} 
        messages={messages} 
        isThinking={isThinking} 
      />
      <AgentChatInput
        agent={agent}
        value={inputMessage}
        onChange={onInputChange}
        onSend={onSendMessage}
        disabled={isThinking}
      />
    </div>
  );
} 