import { AgentChatProviderWrapper } from "@/common/components/chat/agent-chat/agent-chat-provider-wrapper";
import { SuggestionsProvider } from "@/common/components/chat/suggestions";
import type { Suggestion } from "@/common/components/chat/suggestions/suggestion.types";
import { useChatMessageCache } from "@/common/hooks/use-chat-message-cache";
import { ExperimentalInBrowserAgent } from "@/common/lib/runnable-agent/experimental-inbrowser-agent";
import type { AgentDef } from "@/common/types/agent";
import { getLLMProviderConfig } from "@/core/services/ai.service";
import { Message } from "@ag-ui/core";
import type { Context, ToolDefinition } from "@agent-labs/agent-chat";
import { useAgentChat } from "@agent-labs/agent-chat";
import React, { useState } from "react";
import { WorldClassChatHtmlPreview } from "./world-class-chat-html-preview";
import { WorldClassChatInputBar } from "./world-class-chat-input-bar";
import { WorldClassChatMessageList } from "./world-class-chat-message-list";
import { WorldClassChatTopBar } from "./world-class-chat-top-bar";

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
  const [previewHtml, setPreviewHtml] = useState<string | null>(null); // 新增预览状态
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
      <div
        className={
          `w-full h-full flex ${previewHtml ? 'flex-row' : 'flex-col'} bg-gradient-to-br from-indigo-100 to-indigo-50 shadow-lg overflow-hidden transition-all duration-300 ${className ?? ''}`
        }
        style={{
          // 保留渐变背景和阴影
          background: "linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%)",
          boxShadow: "0 4px 24px 0 rgba(99,102,241,0.08)",
        }}
      >
        {/* 左侧：聊天主界面 */}
        <div
          className={
            `flex flex-col h-full min-w-0 flex-1 transition-all duration-300 ${previewHtml ? 'w-1/2 p-0' : 'w-full p-0'}`
          }
          style={{
            boxSizing: "border-box",
            transition: "width 0.35s cubic-bezier(.4,0,.2,1)",
          }}
        >
          <WorldClassChatTopBar agentDef={agentDef} onClear={handleClear} />
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <WorldClassChatMessageList
              messages={uiMessages}
              agentDef={agentDef}
              isResponding={isAgentResponding}
              onPreviewHtml={setPreviewHtml}
            />
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
        {/* 右侧：HTML 预览 */}
        {previewHtml && (
          <div className="min-w-0 flex-1 max-w-1/2 h-full"><WorldClassChatHtmlPreview html={previewHtml} onClose={() => setPreviewHtml(null)} /></div>
        )}
      </div>
    </AgentChatProviderWrapper>
  );
} 