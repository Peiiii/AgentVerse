import React, { useMemo, useState } from "react";
// 类型与hooks
import type { AgentDef } from "@/common/types/agent";
import type { Context, ToolDefinition } from "@agent-labs/agent-chat";
import type { Suggestion } from "@/common/components/chat/suggestions/suggestion.types";
import type { WorldClassChatHtmlPreviewProps } from "./world-class-chat-html-preview";
import type { WorldClassChatSettingsPanelProps } from "./world-class-chat-settings-panel";
import { useAgentChat } from "@agent-labs/agent-chat";
import { useChatMessageCache } from "@/common/hooks/use-chat-message-cache";
import { useSidePanelManager, SidePanelConfig } from "./hooks/use-side-panel-manager";
// 业务组件
import { AgentChatProviderWrapper } from "@/common/components/chat/agent-chat/agent-chat-provider-wrapper";
import { SuggestionsProvider } from "@/common/components/chat/suggestions";
import { ExperimentalInBrowserAgent } from "@/common/lib/runnable-agent/experimental-inbrowser-agent";
import { getLLMProviderConfig } from "@/core/services/ai.service";
import { Message } from "@ag-ui/core";
import { SidePanel } from "./side-panel";
import { WorldClassChatHtmlPreview } from "./world-class-chat-html-preview";
import { WorldClassChatInputBar } from "./world-class-chat-input-bar";
import { WorldClassChatMessageList } from "./world-class-chat-message-list";
import { WorldClassChatSettingsPanel } from "./world-class-chat-settings-panel";
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
  // 1. State & SidePanel
  const [input, setInput] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const sidePanelConfigs: SidePanelConfig[] = useMemo(() => [
    {
      key: 'settings',
      hideCloseButton: false,
      render: (panelProps: Omit<WorldClassChatSettingsPanelProps, 'onPromptChange' | 'onClose'>, close: () => void) => (
        <WorldClassChatSettingsPanel
          {...panelProps}
          onPromptChange={setCustomPrompt}
          onClose={close}
        />
      ),
    },
    {
      key: 'preview',
      hideCloseButton: true,
      render: (panelProps: Omit<WorldClassChatHtmlPreviewProps, 'onClose'>, close: () => void) => (
        <WorldClassChatHtmlPreview
          {...panelProps}
          onClose={close}
        />
      ),
    },
  ], [setCustomPrompt]);
  const {
    activePanel,
    activePanelConfig,
    sidePanelActive,
    openPanel,
    closePanel,
  } = useSidePanelManager(sidePanelConfigs);

  // 2. Agent & Message
  const { providerConfig } = getLLMProviderConfig();
  const agent = new ExperimentalInBrowserAgent({
    ...agentDef,
    model: providerConfig.model,
    baseURL: providerConfig.baseUrl,
    apiKey: providerConfig.apiKey,
  });
  const cacheKey = `chat-messages-${agentDef.id}`;
  const { initialMessages, handleMessagesChange } = useChatMessageCache<Message>(cacheKey);
  const mergedContexts = useMemo(() => {
    const base = Array.isArray(contexts) ? contexts : [];
    if (customPrompt) {
      return [
        ...base,
        { description: "自定义Prompt", value: customPrompt },
      ];
    }
    return base;
  }, [contexts, customPrompt]);
  const {
    uiMessages,
    messages,
    isAgentResponding,
    sendMessage,
    reset
  } = useAgentChat({
    agent,
    tools,
    contexts: mergedContexts,
    initialMessages,
  });

  // 3. Effect
  React.useEffect(() => {
    handleMessagesChange(messages);
  }, [messages, handleMessagesChange]);

  // 4. 业务事件
  const suggestions: Suggestion[] = [
    { id: "1", type: "question", actionName: "你能做什么？", content: "你能做什么？" },
    { id: "2", type: "action", actionName: "清空对话", content: "清空对话" },
    { id: "3", type: "question", actionName: "帮我总结一下今天的工作", content: "帮我总结一下今天的工作" },
    { id: "4", type: "question", actionName: "推荐几个提升效率的AI工具", content: "推荐几个提升效率的AI工具" },
  ];
  const handleSuggestionClick = (suggestion: Suggestion, action: 'send' | 'edit') => {
    if (action === 'send') {
      sendMessage(suggestion.content);
    } else {
      setInput(suggestion.content);
    }
  };
  const handleClear = () => {
    reset();
    setInput("");
    if (onClear) onClear();
  };

  // 5. 渲染
  return (
    <AgentChatProviderWrapper>
      <div
        className={
          `w-full h-full flex flex-row bg-gradient-to-br from-indigo-100 to-indigo-50 shadow-lg overflow-hidden transition-all duration-300 ${className ?? ''}`
        }
        style={{
          background: "linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%)",
          boxShadow: "0 4px 24px 0 rgba(99,102,241,0.08)",
        }}
      >
        {/* 左侧：聊天主界面，宽度动画与右侧面板同步 */}
        <div
          className={
            `flex flex-col h-full min-w-0 transition-all duration-350 ease-[cubic-bezier(.4,0,.2,1)] ${sidePanelActive ? 'basis-1/2' : 'basis-full'} p-0`
          }
          style={{
            boxSizing: "border-box",
            transition: "width 0.35s cubic-bezier(.4,0,.2,1), flex-basis 0.35s cubic-bezier(.4,0,.2,1)",
            width: sidePanelActive ? '50%' : '100%',
            flexBasis: sidePanelActive ? '50%' : '100%',
          }}
        >
          <WorldClassChatTopBar
            agentDef={agentDef}
            onClear={handleClear}
            onSettings={() => openPanel('settings', { prompt: customPrompt })}
          />
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <WorldClassChatMessageList
              messages={uiMessages}
              agentDef={agentDef}
              isResponding={isAgentResponding}
              onPreviewHtml={html => openPanel('preview', { html: html || '' })}
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
        {/* 右侧统一 SidePanel 容器，内容配置驱动，体验自动继承 */}
        <SidePanel
          visible={!!activePanelConfig}
          onClose={closePanel}
          hideCloseButton={activePanelConfig?.hideCloseButton}
        >
          {activePanelConfig?.render(activePanel?.props, closePanel)}
        </SidePanel>
      </div>
    </AgentChatProviderWrapper>
  );
} 