import { ExperimentalInBrowserAgent } from "@/common/lib/runnable-agent";
import {
  useObservableFromState,
  useStateFromObservable,
} from "@/common/lib/rx-state";
import { AgentDef } from "@/common/types/agent";
import { ChatMessage } from "@/common/types/chat";
import { getLLMProviderConfig } from "@/core/services/ai.service";
import { tools, useAgentChat } from "@agent-labs/agent-chat";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { map } from "rxjs";

import { cn } from "@/common/lib/utils";
import { AgentChatHeader } from "./agent-chat-header";
import { AgentChatHeaderWithInfo } from "./agent-chat-header-with-info";
import { AgentChatInput } from "./agent-chat-input";
import { AgentChatMessages, AgentChatMessagesRef } from "./agent-chat-messages";

interface AgentChatContainerProps {
  agentDef: AgentDef;
  messages: ChatMessage[];
  inputMessage: string;
  onInputChange: (value: string) => void;
  showInfoPanel?: boolean;
  defaultInfoExpanded?: boolean;
  compactInfo?: boolean;
  enableFloatingInfo?: boolean;
  className?: string;
  bottomContent?: React.ReactNode; // 新增插槽
}

export interface AgentChatContainerRef {
  showFloatingInfo: () => void;
  hideFloatingInfo: () => void;
  toggleFloatingInfo: () => void;
  isFloatingInfoVisible: () => boolean;
}

export const AgentChatContainer = forwardRef<AgentChatContainerRef, AgentChatContainerProps>(({
  agentDef: agentDef,
  messages,
  inputMessage,
  onInputChange,
  showInfoPanel = false,
  defaultInfoExpanded = false,
  compactInfo = false,
  enableFloatingInfo = false,
  className,
  bottomContent, // 新增
}, ref) => {
  const agentDef$ = useObservableFromState(agentDef);
  const [initialAgent] = useState(() => {
    const { providerConfig } = getLLMProviderConfig();
    return new ExperimentalInBrowserAgent({
      ...agentDef,
      model: providerConfig.model,
      baseURL: providerConfig.baseUrl,
      apiKey: providerConfig.apiKey,
    });
  })
  const agent = useStateFromObservable(
    () =>
      agentDef$.pipe(
        map((agentDef) => {
          const { providerConfig } = getLLMProviderConfig();
          return new ExperimentalInBrowserAgent({
            ...agentDef,
            model: providerConfig.model,
            baseURL: providerConfig.baseUrl,
            apiKey: providerConfig.apiKey,
          });
        })
      ),
    initialAgent
  );

  const { uiMessages, isAgentResponding, sendMessage, abortAgentRun } = useAgentChat({
    agent,
    tools: tools,
    contexts: [{
      description: "你的设定",
      value: JSON.stringify(agentDef),
    }],
    initialMessages: messages.map((message) => ({
      id: message.id,
      role: message.isUser ? "user" : "assistant",
      content: message.content,
    })),
  });

  const messagesRef = useRef<AgentChatMessagesRef>(null);

  // 悬浮层状态管理
  const [isFloatingInfoVisible, setIsFloatingInfoVisible] = useState(false);

  // 暴露给外部的控制接口
  useImperativeHandle(ref, () => ({
    showFloatingInfo: () => setIsFloatingInfoVisible(true),
    hideFloatingInfo: () => setIsFloatingInfoVisible(false),
    toggleFloatingInfo: () => setIsFloatingInfoVisible(prev => !prev),
    isFloatingInfoVisible: () => isFloatingInfoVisible,
  }), [isFloatingInfoVisible]);

  // 简单的自动滚动：当消息数量变化时滚动到底部
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollToBottom();
    }
  }, [uiMessages.length]);

  // 处理输入变化 - 不再自动隐藏悬浮层
  const handleInputChange = useCallback((value: string) => {
    onInputChange(value);
  }, [onInputChange]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      // 发送消息时自动隐藏悬浮层
      if (enableFloatingInfo) {
        setIsFloatingInfoVisible(false);
      }
      
      await sendMessage(inputMessage);
      onInputChange(""); // 清空输入
    } catch (error) {
      console.error("发送消息失败:", error);
    }
  };

  return (
    <div className={cn("min-w-0 flex flex-col", className)}>
      {showInfoPanel ? (
        <AgentChatHeaderWithInfo 
          agent={agentDef} 
          showInfoPanel={showInfoPanel}
          defaultExpanded={defaultInfoExpanded}
          compact={compactInfo}
        />
      ) : (
        <AgentChatHeader 
          agent={agentDef}
          showFloatingInfo={enableFloatingInfo}
          isFloatingInfoVisible={isFloatingInfoVisible}
          onFloatingInfoVisibilityChange={setIsFloatingInfoVisible}
        />
      )}
      <AgentChatMessages
        ref={messagesRef}
        agent={agentDef}
        uiMessages={uiMessages}
        isResponding={isAgentResponding}
        messageTheme="default"
        avatarTheme="default"
      />
      {/* 新增：底部插槽 */}
      {bottomContent}
      <AgentChatInput
        agent={agentDef}
        value={inputMessage}
        onChange={handleInputChange}
        onSend={handleSendMessage}
        onAbort={abortAgentRun}
        sendDisabled={isAgentResponding}
      />
    </div>
  );
});
