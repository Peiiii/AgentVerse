import { AgentChatContainer } from "@/common/components/chat/agent-chat";
import { AgentChatProviderWrapper } from "@/common/components/chat/agent-chat/agent-chat-provider-wrapper";
import { SuggestionsProvider } from "@/common/components/chat/suggestions";
import type { Suggestion } from "@/common/components/chat/suggestions/suggestion.types";
import { AgentTool, useProvideAgentTools } from "@/common/hooks/use-provide-agent-tools";
import { AgentDef } from "@/common/types/agent";
import { ChatMessage } from "@/common/types/chat";
import { useCallback, useState } from "react";
import { codeAnalysisTool, fileSystemTool, getCurrentTimeTool, networkTool } from "../agent-tools";
import { createDisplayQuickActionsTool } from "../agent-tools/display-quick-actions.tool";

interface AgentPreviewChatProps {
  agentDef: AgentDef;
  className?: string;
  tools?: AgentTool[];
  enableSuggestions?: boolean;
}

function AgentPreviewChatInner({
  agentDef,
  className,
  tools,
  enableSuggestions = true
}: AgentPreviewChatProps) {
  const [chatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  // 创建 suggestion tool
  const suggestionTool = createDisplayQuickActionsTool(setSuggestions);

  // 工具集合，包含 suggestion tool
  const previewTools = [
    ...(tools || []),
    getCurrentTimeTool,
    fileSystemTool,
    codeAnalysisTool,
    networkTool,
    suggestionTool
  ];
  useProvideAgentTools(previewTools);

  // 处理输入变化
  const handleInputChange = useCallback((value: string) => {
    setInputMessage(value);
  }, []);

  // 处理建议点击
  const handleSuggestionClick = useCallback((suggestion: Suggestion, action: 'send' | 'edit') => {
    if (action === 'edit') {
      setInputMessage(suggestion.content);
    }
  }, []);

  // 处理发送消息
  const handleSendMessage = useCallback((message: string) => {
    // 这里可以添加发送消息的逻辑
    console.log('Sending message:', message);
    // 可以调用聊天组件的发送方法
  }, []);

  // 作为bottomContent插槽传递
  const suggestionsNode = enableSuggestions ? (
    <SuggestionsProvider
      suggestions={suggestions}
      onSuggestionClick={handleSuggestionClick}
      onSendMessage={handleSendMessage}
      onClose={() => setSuggestions([])}
      className="mt-2"
    />
  ) : null;

  return (
    <AgentChatContainer
      className={className}
      agentDef={agentDef}
      messages={chatMessages}
      inputMessage={inputMessage}
      onInputChange={handleInputChange}
      showInfoPanel={false}
      defaultInfoExpanded={false}
      compactInfo={true}
      enableFloatingInfo={true}
      bottomContent={suggestionsNode}
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