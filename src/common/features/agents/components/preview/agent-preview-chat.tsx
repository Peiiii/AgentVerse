import { AgentChatContainer, type AgentChatContainerRef } from "@/common/components/chat/agent-chat";
import { useProvideAgentTools } from "@/common/hooks/use-provide-agent-tools";
import { AgentDef } from "@/common/types/agent";
import { ChatMessage } from "@/common/types/chat";
import { useCallback, useRef, useState } from "react";
import { AgentChatProviderWrapper } from "@/common/components/chat/agent-chat/agent-chat-provider-wrapper";
import { getDefaultPreviewTools } from "./agent-preview-tools";

interface AgentPreviewChatProps {
  agentDef: AgentDef;
  className?: string;
  tools?: ReturnType<typeof getDefaultPreviewTools>;
}

function AgentPreviewChatInner({ agentDef, className, tools }: AgentPreviewChatProps) {
  const [chatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const chatContainerRef = useRef<AgentChatContainerRef>(null);

  // 使用可插拔的工具配置
  const previewTools = tools || getDefaultPreviewTools(agentDef);
  useProvideAgentTools(previewTools);

  // 处理输入变化
  const handleInputChange = useCallback((value: string) => {
    setInputMessage(value);
  }, []);

  return (
    <AgentChatContainer
      className={className}
      ref={chatContainerRef}
      agentDef={agentDef}
      messages={chatMessages}
      inputMessage={inputMessage}
      onInputChange={handleInputChange}
      showInfoPanel={false}
      defaultInfoExpanded={false}
      compactInfo={true}
      enableFloatingInfo={true}
    />
  );
}

export function AgentPreviewChat(props: AgentPreviewChatProps) {
  return (
    <AgentChatProviderWrapper>
      <AgentPreviewChatInner {...props} />
    </AgentChatProviderWrapper>
  );
} 