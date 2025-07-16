import { useState } from "react";
import type { AgentDef } from "@/common/types/agent";
import type { ToolDefinition, Context } from "@agent-labs/agent-chat";
import { AgentChatProviderWrapper } from "@/common/components/chat/agent-chat/agent-chat-provider-wrapper";
import { useAgentChat } from "@agent-labs/agent-chat";
import { ExperimentalInBrowserAgent } from "@/common/lib/runnable-agent/experimental-inbrowser-agent";
import { getLLMProviderConfig } from "@/core/services/ai.service";
import { WorldClassChatTopBar } from "./world-class-chat-top-bar";
import { WorldClassChatMessageList } from "./world-class-chat-message-list";
import { WorldClassChatInputBar } from "./world-class-chat-input-bar";
import { SuggestionsProvider } from "@/common/components/chat/suggestions";
import type { Suggestion } from "@/common/components/chat/suggestions/suggestion.types";
import { useChatMessageCache } from "@/common/hooks/use-chat-message-cache";
import React from "react";
import { Message } from "@ag-ui/core";

export interface WorldClassChatContainerProps {
  agentDef: AgentDef;
  tools?: ToolDefinition[];
  contexts?: Context[];
  className?: string;
  onClear?: () => void;
}

export function WorldClassChatContainer({
  agentDef,
  tools = [],
  contexts = [],
  className,
  onClear,
}: WorldClassChatContainerProps) {
  const [input, setInput] = useState("");
  const { providerConfig } = getLLMProviderConfig();
  const agent = new ExperimentalInBrowserAgent({
    ...agentDef,
    model: providerConfig.model,
    baseURL: providerConfig.baseUrl,
    apiKey: providerConfig.apiKey,
  });
  // 聊天消息缓存（可插拔）
  const cacheKey = `chat-messages-${agentDef.id}`;
  const { initialMessages, handleMessagesChange } = useChatMessageCache<Message>(cacheKey);
  const {
    uiMessages,
    messages,
    isAgentResponding,
    sendMessage,
    reset
  } = useAgentChat({
    agent,
    tools,
    contexts,
    initialMessages,
  });

  console.log("[WorldClassChatContainer] messages", messages);

  // 监听消息变化并缓存
  React.useEffect(() => {
    handleMessagesChange(messages);
  }, [messages, handleMessagesChange]);

  // 推荐项（模拟智能推荐，后续可接入AI/运营配置）
  const suggestions: Suggestion[] = [
    {
      id: "1",
      type: "question",
      actionName: "你能做什么？",
      content: "你能做什么？",
    },
    {
      id: "2",
      type: "action",
      actionName: "清空对话",
      content: "清空对话",
    },
    {
      id: "3",
      type: "question",
      actionName: "帮我总结一下今天的工作",
      content: "帮我总结一下今天的工作",
    },
    {
      id: "4",
      type: "question",
      actionName: "推荐几个提升效率的AI工具",
      content: "推荐几个提升效率的AI工具",
    },
  ];

  // 推荐项点击：自动发送消息并清空输入
  const handleSuggestionClick = (suggestion: Suggestion, action: 'send' | 'edit') => {
    if (action === 'send') {
      sendMessage(suggestion.content);
    } else {
      setInput(suggestion.content);
    }
  };

  // 清空消息处理（只需 reset，缓存会自动同步）
  const handleClear = () => {
    reset();
    setInput("");
    if (onClear) onClear();
  };

  return (
    <AgentChatProviderWrapper>
      <div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%)",
        borderRadius: 24,
        boxShadow: "0 4px 24px 0 rgba(99,102,241,0.08)",
        overflow: "hidden",
        padding: "0 16px 0 16px", // 新增左右内边距
      }} className={className}>
        <WorldClassChatTopBar agentDef={agentDef} onClear={handleClear} />
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <WorldClassChatMessageList messages={uiMessages} agentDef={agentDef} isResponding={isAgentResponding} />
        </div>
        <SuggestionsProvider
          suggestions={suggestions}
          onSuggestionClick={handleSuggestionClick}
        />
        <WorldClassChatInputBar value={input} onChange={setInput} onSend={async () => {
          if (!input.trim()) return;
          await sendMessage(input);
          setInput("");
        }} />
      </div>
    </AgentChatProviderWrapper>
  );
} 