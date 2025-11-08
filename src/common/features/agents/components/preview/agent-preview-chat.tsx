import { AgentChatContainer, AgentChatContainerRef } from "@/common/features/chat/components/agent-chat";
import { AgentChatProviderWrapper } from "@/common/features/chat/components/agent-chat/agent-chat-provider-wrapper";
import { SuggestionsProvider } from "@/common/features/chat/components/suggestions";
import type { Suggestion } from "@/common/features/chat/components/suggestions/suggestion.types";
import { AgentTool, useProvideAgentTools } from "@/common/hooks/use-provide-agent-tools";
import { AgentDef } from "@/common/types/agent";
import { ChatMessage } from "@/common/types/chat";
import { useCallback, useRef, useState } from "react";
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
  const chatContainerRef = useRef<AgentChatContainerRef>(null);

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
    } else {
      setInputMessage(suggestion.content);
      // 使用 setTimeout 确保状态更新后再发送
      setTimeout(() => {
        if (chatContainerRef.current?.handleSendMessage) {
          chatContainerRef.current.handleSendMessage();
        }
      }, 0);
    }
  }, []);


  // 作为bottomContent插槽传递
  const suggestionsNode = enableSuggestions ? (
    <SuggestionsProvider
      suggestions={suggestions}
      onSuggestionClick={handleSuggestionClick}
      onClose={() => setSuggestions([])}
      className="mt-2"
    />
  ) : null;

  return (
    <AgentChatContainer
      ref={chatContainerRef}
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