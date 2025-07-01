import { ExperimentalInBrowserAgent } from "@/common/lib/runnable-agent";
import {
  useObservableFromState,
  useStateFromObservable,
} from "@/common/lib/rx-state";
import { AgentDef } from "@/common/types/agent";
import { ChatMessage } from "@/common/types/chat";
import { getLLMProviderConfig } from "@/core/services/ai.service";
import { tools, useAgentChat } from "@agent-labs/agent-chat";
import { useState } from "react";
import { map } from "rxjs";
import { AgentChatHeader } from "./agent-chat-header";
import { AgentChatInput } from "./agent-chat-input";
import { AgentChatMessages } from "./agent-chat-messages";

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

  const { uiMessages, isAgentResponding, sendMessage } = useAgentChat({
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
        agent={agentDef}
        uiMessages={uiMessages}
        isThinking={isAgentResponding}
      />
      <AgentChatInput
        agent={agentDef}
        value={inputMessage}
        onChange={onInputChange}
        onSend={handleSendMessage}
        disabled={isAgentResponding}
      />
    </div>
  );
}
