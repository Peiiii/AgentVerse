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
import { X } from "lucide-react";

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
            `flex flex-col h-full min-w-0 transition-all duration-300 ${previewHtml ? 'flex-1 w-1/2 p-0' : 'w-full p-0'}`
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
          <div
            style={{
              flex: 1,
              width: "50%",
              minWidth: 0,
              background: "#fff",
              boxShadow: "-2px 0 16px 0 rgba(99,102,241,0.06)",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              animation: "fadeInRight 0.4s cubic-bezier(.4,0,.2,1)",
            }}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setPreviewHtml(null)}
              style={{
                position: "absolute",
                top: 18,
                right: 18,
                zIndex: 10,
                background: "#f4f6fb",
                border: "none",
                borderRadius: 8,
                padding: 4,
                cursor: "pointer",
                boxShadow: "0 1px 4px #a5b4fc22",
                transition: "background 0.18s",
              }}
              title="关闭预览"
            >
              <X size={18} color="#6366f1" />
            </button>
            <div style={{ flex: 1, overflow: "auto", padding: 32 }}>
              <div style={{ borderRadius: 12, boxShadow: "0 2px 12px 0 rgba(99,102,241,0.04)", overflow: "hidden", background: "#fff", minHeight: 200 }}>
                {/* SSR/CSR 安全警告：如有需要可用 sandboxed iframe 替换 */}
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
            </div>
            {/* 动画 keyframes */}
            <style>{`
              @keyframes fadeInRight {
                from { opacity: 0; transform: translateX(48px); }
                to { opacity: 1; transform: none; }
              }
            `}</style>
          </div>
        )}
      </div>
    </AgentChatProviderWrapper>
  );
} 