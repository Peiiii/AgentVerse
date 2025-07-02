import { ExperimentalInBrowserAgent } from "@/common/lib/runnable-agent";
import {
  useObservableFromState,
  useStateFromObservable,
} from "@/common/lib/rx-state";
import { AgentDef } from "@/common/types/agent";
import { ChatMessage } from "@/common/types/chat";
import { getLLMProviderConfig } from "@/core/services/ai.service";
import { tools, useAgentChat } from "@agent-labs/agent-chat";
import { useEffect, useRef, useState } from "react";
import { map } from "rxjs";
import { AgentChatHeader } from "./agent-chat-header";
import { AgentChatInput } from "./agent-chat-input";
import { AgentChatMessages, AgentChatMessagesRef } from "./agent-chat-messages";

interface AgentChatContainerProps {
  agent: AgentDef;
  messages: ChatMessage[];
  inputMessage: string;
  onInputChange: (value: string) => void;
}

export function AgentChatContainer({
  agent: agentDef,
  messages,
  inputMessage,
  onInputChange,
}: AgentChatContainerProps) {
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

  // 简单的自动滚动：当消息数量变化时滚动到底部
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollToBottom();
    }
  }, [uiMessages.length]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      await sendMessage(inputMessage);
      onInputChange(""); // 清空输入
    } catch (error) {
      console.error("发送消息失败:", error);
    }
  };

  return (
    <div className="w-1/2 min-w-0 flex flex-col">
      <AgentChatHeader agent={agentDef} />
      <AgentChatMessages
        ref={messagesRef}
        agent={agentDef}
        uiMessages={uiMessages}
        isResponding={isAgentResponding}
        messageTheme="default"
        avatarTheme="default"
      />
      <AgentChatInput
        agent={agentDef}
        value={inputMessage}
        onChange={onInputChange}
        onSend={handleSendMessage}
        onAbort={abortAgentRun}
        sendDisabled={isAgentResponding}
      />
    </div>
  );
}
