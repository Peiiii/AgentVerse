import { ExperimentalInBrowserAgent } from "@/common/lib/runnable-agent";
import { cn } from "@/common/lib/utils";
import { AgentDef } from "@/common/types/agent";
import { getLLMProviderConfig } from "@/core/services/ai.service";
import { tools, useAgentChat } from "@agent-labs/agent-chat";
import {
  Wand2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AgentChatInput, AgentChatMessages } from "../chat/agent-chat";
import { ChatWelcomeHeader } from "../chat/chat-welcome-header";


interface AiChatCreatorProps {
  onAgentCreate: (agent: Omit<AgentDef, "id">) => void;
  className?: string;
}

export function AiChatCreator({ className }: AiChatCreatorProps) {
  // 使用useMemo缓存agentCreatorDef，避免每次渲染重新创建
  const agentCreatorDef = useMemo((): Omit<AgentDef, "id"> => ({
    name: "Agent Creator",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=creator",
    prompt: "你是一个智能体定制助手，帮助用户通过对话创建专属AI智能体。请用友好、引导式的语气和用户交流，并根据用户描述生成合适的agent配置。",
    role: "participant",
    personality: "耐心、善于引导、专业",
    expertise: ["agent创建", "需求分析", "AI定制"],
    bias: "倾向于帮助用户明确需求并生成合适的agent配置",
    responseStyle: "简洁、结构化、引导式",
  }), []);

  // 使用useState缓存agent实例，避免无限重新创建
  const [agentCreatorAgent] = useState(() => {
    const { providerConfig } = getLLMProviderConfig();
    return new ExperimentalInBrowserAgent({
      ...agentCreatorDef,
      model: providerConfig.model,
      baseURL: providerConfig.baseUrl,
      apiKey: providerConfig.apiKey,
    });
  });

  // 使用useMemo缓存contexts，避免每次渲染重新创建
  const contexts = useMemo(() => [{
    description: "你的设定",
    value: JSON.stringify(agentCreatorDef),
  }], [agentCreatorDef]);

  // 使用useMemo缓存initialMessages，避免每次渲染重新创建
  // const initialMessages = useMemo(() => [
  //   {
  //     id: "ai-creator-welcome", // 修改ID避免冲突
  //     role: "assistant" as const,
  //     content:
  //       "✨ 你好！我是AI助手，让我帮你创建一个完美的智能体。\n\n请告诉我你想要什么样的智能体？比如：\n- 它的专业领域是什么？\n- 应该有什么样的性格？\n- 主要用途是什么？",
  //   },
  // ], []);

  const {
    uiMessages,
    isAgentResponding,
    sendMessage,
    // reset, // 暂时不需要
  } = useAgentChat({
    agent: agentCreatorAgent,
    tools: tools,
    contexts,
    // initialMessages,
  });

  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    try {
      await sendMessage(inputValue);
      setInputValue("");
    } catch (error) {
      console.error("发送消息失败:", error);
    }
  };

  // 创建自定义欢迎头部
  const customWelcomeHeader = (
    <ChatWelcomeHeader
      title="AI智能体创建助手"
      description="通过对话创建你的专属智能体。请告诉我你想要什么样的智能体？比如它的专业领域、性格特征和主要用途。"
      centerIcon={<Wand2 className="w-6 h-6" />}
      centerIconClassName="filter drop-shadow(0 0 8px rgba(255,255,255,0.8))"
      theme="magic"
      containerSize="md"
      showMagicCircles={true}
      showStarDecorations={true}
    />
  );

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* 聊天区域 - 使用AgentChatMessages替换 */}
      <div className="flex-1 overflow-hidden">
        <AgentChatMessages
          agent={{ id: "creator", ...agentCreatorDef }}
          uiMessages={uiMessages}
          isResponding={isAgentResponding}
          messageTheme="creator"
          avatarTheme="creator"
          emptyState={{
            title: "", // 不会被使用，因为有customWelcomeHeader
            description: "", // 不会被使用，因为有customWelcomeHeader
            customWelcomeHeader: customWelcomeHeader,
          }}
        />
      </div>
      {/* 使用AgentChatInput替换原有输入区域 */}
      <AgentChatInput
        agent={{ id: "creator", ...agentCreatorDef }}
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSendMessage}
        sendDisabled={isAgentResponding}
        customPlaceholder="描述你想要的智能体..."
        containerWidth="narrow"
      />
    </div>
  );
} 